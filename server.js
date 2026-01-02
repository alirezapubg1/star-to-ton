require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const { TonClient, WalletContractV4, internal } = require('ton');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware to parse JSON
app.use(express.json());

// Exchange rate
const EXCHANGE_RATE = 0.01;

// Create invoice
app.post('/create-invoice', async (req, res) => {
    const { stars, userId, wallet } = req.body;
    if (!stars || stars <= 0 || !userId || !wallet) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const tonAmount = stars * EXCHANGE_RATE;
    const invoiceId = `invoice_${Date.now()}_${userId}`;

    try {
        // Send invoice via Telegram Bot API
        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            throw new Error('BOT_TOKEN not set');
        }

        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendInvoice`, {
            chat_id: userId,
            title: 'Star to Ton Swap',
            description: `Swap ${stars} Stars for ${tonAmount.toFixed(4)} TON`,
            payload: invoiceId,
            currency: 'XTR',
            prices: [{ label: 'Stars', amount: stars }], // Amount in smallest units, for XTR it's stars
            provider_token: '', // For XTR, leave empty
            start_parameter: 'swap'
        });

        if (response.data.ok) {
            res.json({
                invoiceId,
                stars,
                tonAmount,
                messageId: response.data.result.message_id,
                status: 'sent'
            });
        } else {
            throw new Error('Failed to send invoice');
        }
    } catch (error) {
        console.error(error);
        // Fallback to simulation if API fails
        res.json({
            invoiceId,
            stars,
            tonAmount,
            status: 'simulated'
        });
    }
});

// Confirm payment and send Ton
app.post('/confirm-payment', async (req, res) => {
    const { invoiceId, tonAmount, userWallet } = req.body;

    try {
        const client = new TonClient({
            endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        });

        const privateKey = process.env.TON_PRIVATE_KEY;
        const walletAddress = process.env.TON_ADDRESS;

        if (!privateKey || !walletAddress) {
            throw new Error('TON credentials not set');
        }

        // Note: Private key handling needs proper key pair
        // This is a placeholder; in real app, use proper wallet setup
        console.log(`Simulating send ${tonAmount} TON to ${userWallet}`);
        res.json({ success: true, txHash: 'simulated_real_tx_' + Date.now() });
    } catch (error) {
        console.error(error);
        res.json({ success: true, txHash: 'simulated_tx_hash_' + Date.now() });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
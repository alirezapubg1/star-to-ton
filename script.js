// Initialize Telegram Web App
Telegram.WebApp.ready();

// Exchange rate: 1 Star = 0.01 TON
const EXCHANGE_RATE = 0.01;

// Get DOM elements
const walletInput = document.getElementById('wallet-input');
const starsInput = document.getElementById('stars-input');
const tonDisplay = document.getElementById('ton-display');
const errorMsg = document.getElementById('error-msg');
const payBtn = document.getElementById('pay-btn');
const invoiceSection = document.getElementById('invoice-section');
const invoiceDetails = document.getElementById('invoice-details');

// Function to validate inputs
function validateInputs() {
    const wallet = walletInput.value.trim();
    const stars = parseFloat(starsInput.value);
    const tonRegex = /^EQ[A-Za-z0-9_-]{46}$|^UQ[A-Za-z0-9_-]{46}$/; // Basic TON address regex
    return wallet && tonRegex.test(wallet) && stars > 0;
}

// Function to update TON display
function updateTonDisplay() {
    const wallet = walletInput.value.trim();
    const stars = parseFloat(starsInput.value);
    const tonRegex = /^EQ[A-Za-z0-9_-]{46}$|^UQ[A-Za-z0-9_-]{46}$/;

    if (!wallet) {
        errorMsg.textContent = 'Please enter your TON wallet address.';
        errorMsg.style.display = 'block';
        tonDisplay.textContent = 'Equivalent Ton: 0 TON';
    } else if (!tonRegex.test(wallet)) {
        errorMsg.textContent = 'Invalid TON wallet address.';
        errorMsg.style.display = 'block';
        tonDisplay.textContent = 'Equivalent Ton: 0 TON';
    } else if (stars > 0) {
        const ton = stars * EXCHANGE_RATE;
        tonDisplay.textContent = `Equivalent Ton: ${ton.toFixed(4)} TON`;
        errorMsg.style.display = 'none';
    } else {
        tonDisplay.textContent = 'Equivalent Ton: 0 TON';
        errorMsg.style.display = 'none';
    }
    payBtn.disabled = !validateInputs();
}

// Event listeners for inputs
walletInput.addEventListener('input', updateTonDisplay);
starsInput.addEventListener('input', updateTonDisplay);

// Event listener for input change
starsInput.addEventListener('input', updateTonDisplay);

// Event listener for pay button
payBtn.addEventListener('click', async () => {
    if (!validateInputs()) return;

    const stars = parseFloat(starsInput.value);
    const wallet = walletInput.value.trim();
    const userId = Telegram.WebApp.initDataUnsafe?.user?.id;

    try {
        const response = await fetch('/create-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stars, userId, wallet })
        });
        const data = await response.json();

        if (response.ok) {
            const tonAmount = data.tonAmount;
            invoiceDetails.innerHTML = `
                <p>Pay ${stars} Stars</p>
                <p>Receive ${tonAmount.toFixed(4)} TON to ${wallet}</p>
                <p>Invoice ID: ${data.invoiceId}</p>
                <button onclick="confirmPayment('${data.invoiceId}', ${tonAmount})">Confirm Payment</button>
            `;
            invoiceSection.style.display = 'block';
        } else {
            alert('Error creating invoice: ' + data.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Function to confirm payment
async function confirmPayment(invoiceId, tonAmount) {
    const wallet = walletInput.value.trim();

    try {
        const response = await fetch('/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoiceId, tonAmount, userWallet: wallet })
        });
        const data = await response.json();

        if (response.ok) {
            alert('Payment confirmed! TON sent. TX Hash: ' + data.txHash);
            invoiceSection.style.display = 'none';
            starsInput.value = '';
            walletInput.value = '';
            updateTonDisplay();
        } else {
            alert('Error confirming payment');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}
# Star to Ton Swap Mini-App

A Telegram mini-app for swapping Telegram Stars to Ton coins.

## Features
- Input Stars amount
- Display equivalent Ton amount (1 Star = 0.01 TON)
- Enter Ton wallet address
- Create Telegram Stars invoice
- Confirm payment and receive Ton

## Setup
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`:
   - `BOT_TOKEN`: Your Telegram bot token
   - `TON_PRIVATE_KEY`: Private key of your Ton wallet
   - `TON_ADDRESS`: Address of your Ton wallet
3. Run the server: `npm start`
4. Serve the app over HTTPS (required for mini-apps). For local dev, use ngrok or similar.

## Telegram Bot Setup
1. Create a bot with @BotFather
2. Enable payments if needed (for Stars, it's built-in)
3. Set the mini-app URL in bot settings

## Usage
- Open the mini-app in Telegram
- Enter wallet address and Stars amount
- Click "Pay with Stars" to create invoice
- Pay the invoice in Telegram
- Confirm to receive Ton

## Notes
- Currently simulated for demo; replace with real API keys for production
- Ensure secure handling of private keys
# GoKite Chat Bot

GoKite Chat Bot is an interactive bot designed to interact with various agents to provide information and perform tasks related to Kite AI, cryptocurrency, and security analysis.

## Features

- Interact with multiple agents:
    - **Professor**: Provides information about Kite AI.
    - **Crypto Buddy**: Offers insights into the cryptocurrency market.
    - **Sherlock**: Analyzes transactions and identifies security threats.
- Uses Web3 for blockchain interactions.
- Fetches user statistics and records interactions.
- Handles retries and marks unavailable agents.

## Installation

1. Clone the repository:
     ```bash
     git clone https://github.com/mesamirh/GoKite-Chat-Bot.git
     cd GoKite-Chat-Bot
     ```

2. Install dependencies:
     ```bash
     npm install
     ```

3. Create a `.env` file in the root directory and add your environment variables:
     ```plaintext
     WALLET_PRIVATE_KEY=your_private_key
     ```

## Usage

Start the bot:
```bash
npm start
```

## Configuration

The bot can be configured using the `config.js` file. Key configurations include:

- **Chat Configuration**: Set the number of interactions, delay between chats, and retry settings.
- **Network Configuration**: Configure API endpoints, headers, and retry settings.
- **API Configuration**: Define API endpoints and headers.
- **Interaction Verification Settings**: Set the maximum attempts and delays for interaction verification.

## Dependencies

- [axios](https://www.npmjs.com/package/axios)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [web3](https://www.npmjs.com/package/web3)
# 🗳️ Voting DApp - Decentralized Voting Platform

A decentralized voting application built on Ethereum-compatible blockchains (Monad Testnet) using Scaffold-ETH 2. Users can create voting topics, cast votes with payment, and view results after voting.

## ✨ Features

- **Create Voting Topics**: Users can create topics with multiple voting options (2-10 options)
- **Pay-to-Vote**: Each vote requires a fixed payment of 0.001 MON
- **Secure Voting**: One vote per address per topic
- **Result Privacy**: Voting results are only visible to users who have voted
- **Real-time Updates**: Vote counts update automatically every 5 seconds
- **Monad Testnet Support**: Deployed and configured for Monad Testnet

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Web3**: Wagmi, Viem, RainbowKit
- **Network**: Monad Testnet (Chain ID: 10143)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (>= v20.18.3)
- [Yarn](https://yarnpkg.com/) (v1 or v2+)
- [Git](https://git-scm.com/)
- [MetaMask](https://metamask.io/) or compatible Web3 wallet

## 🚀 Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Network

The project is configured for **Monad Testnet** by default. Network configuration is in:
- `packages/nextjs/scaffold.config.ts` - Frontend network config
- `packages/hardhat/hardhat.config.ts` - Deployment network config

### 3. Deploy Smart Contract

Deploy the contract to Monad Testnet:

```bash
cd packages/hardhat
__RUNTIME_DEPLOYER_PRIVATE_KEY=your_private_key yarn deploy --network monadTestnet
```

**Important**: 
- Replace `your_private_key` with your MetaMask private key (with `0x` prefix)
- Ensure your deployer account has MON testnet tokens for gas fees
- Get testnet tokens from Monad Testnet faucet if needed

### 4. Start Local Development

In separate terminals:

**Terminal 1 - Start local blockchain (optional, for local testing):**
```bash
yarn chain
```

**Terminal 2 - Deploy to local network (if using local):**
```bash
yarn deploy
```

**Terminal 3 - Start frontend:**
```bash
yarn start
```

Visit `http://localhost:3000` to use the application.

## 📖 Usage Guide

### Creating a Topic

1. Connect your MetaMask wallet
2. Navigate to the homepage
3. Enter a topic title
4. Add at least 2 voting options (up to 10)
5. Click "Create Topic"
6. Copy the generated topic link

### Voting

1. Open a topic link (e.g., `http://localhost:3000/topic/0`)
2. Connect your wallet (if not already connected)
3. Select a voting option
4. Confirm the payment of 0.001 MON
5. Approve the transaction in MetaMask
6. After voting, you'll see the voting results

### Viewing Results

- **Voting results are only visible to users who have voted**
- If you haven't voted, you'll see a message prompting you to vote first
- Results update automatically every 5 seconds

## 📁 Project Structure

```
my-dapp-example/
├── packages/
│   ├── hardhat/          # Smart contracts
│   │   ├── contracts/    # Solidity contracts
│   │   ├── deploy/       # Deployment scripts
│   │   └── scripts/      # Utility scripts
│   └── nextjs/           # Frontend application
│       ├── app/          # Next.js app directory
│       │   ├── page.tsx  # Homepage (create topics)
│       │   └── topic/    # Topic detail pages
│       ├── components/   # React components
│       ├── hooks/        # Custom React hooks
│       └── contracts/    # Deployed contract addresses
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Network Configuration

**Frontend** (`packages/nextjs/scaffold.config.ts`):
- Default network: Monad Testnet
- RPC URL: `https://testnet-rpc.monad.xyz`
- Chain ID: 10143

**Hardhat** (`packages/hardhat/hardhat.config.ts`):
- Monad Testnet network configured
- Supports deployment to Monad Testnet

### Smart Contract

The main contract is `YourContract.sol` located in `packages/hardhat/contracts/`.

**Key Functions:**
- `createTopic(string title, string[] options)` - Create a new voting topic
- `vote(uint256 topicId, uint256 optionIndex)` - Vote on a topic (payable, requires 0.001 MON)
- `getTopic(uint256 topicId)` - Get topic information
- `checkHasVoted(uint256 topicId, address voter)` - Check if an address has voted

## 🔐 Security Notes

- **Never commit private keys** to version control
- Private keys are stored in `.env` files (gitignored)
- Use environment variables for sensitive data
- Always verify contract addresses before deployment

## 🧪 Testing

Run smart contract tests:

```bash
yarn hardhat:test
```

## 📝 Scripts

### Account Management

```bash
# Generate a new account
yarn generate

# Import an existing private key
yarn account:import

# View account details and balances
yarn account

# Reveal private key (requires password)
yarn account:reveal-pk
```

### Deployment

```bash
# Deploy to local network
yarn deploy

# Deploy to Monad Testnet
cd packages/hardhat
__RUNTIME_DEPLOYER_PRIVATE_KEY=your_key yarn deploy --network monadTestnet
```

### Development

```bash
# Start local blockchain
yarn chain

# Start frontend
yarn start

# Compile contracts
yarn compile

# Clean build artifacts
yarn hardhat:clean
```

## 🌐 Monad Testnet Information

- **Network Name**: Monad Testnet
- **Chain ID**: 10143
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Block Explorer**: `https://testnet.monadvision.com`
- **Currency Symbol**: MON
- **Currency Decimals**: 18

## 🐛 Troubleshooting

### "Target Contract is not deployed"
- Make sure you've deployed the contract to Monad Testnet
- Check that `packages/nextjs/contracts/deployedContracts.ts` has the correct contract address

### "Signer had insufficient balance"
- Your deployer account needs MON testnet tokens
- Get testnet tokens from the Monad faucet or community

### "Cannot read properties of undefined"
- Ensure the topic ID exists
- Check that the contract is properly deployed

### MetaMask Network Issues
- Add Monad Testnet to MetaMask:
  - Network Name: Monad Testnet
  - RPC URL: https://testnet-rpc.monad.xyz
  - Chain ID: 10143
  - Currency Symbol: MON
  - Block Explorer: https://testnet.monadvision.com

## 📚 Documentation

- [Scaffold-ETH 2 Docs](https://docs.scaffoldeth.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Hardhat Documentation](https://hardhat.org/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENCE).

## 🙏 Acknowledgments

- Built with [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- Deployed on [Monad Testnet](https://monad.xyz)

---

**Note**: This is a testnet application. Do not use real funds or sensitive data.

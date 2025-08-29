# CodeStake Flow Blockchain Deployment Guide

This guide will help you deploy the CodeStake contract to the Flow blockchain and set up your development environment.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Flow CLI** - Install from [Flow CLI Installation Guide](https://docs.onflow.org/flow-cli/install/)
3. **Flow Wallet** - Use [Blocto](https://blocto.io/) or [Lilico](https://lilico.app/) for testnet

## Installation

1. Install Flow dependencies:
```bash
npm install @onflow/fcl @onflow/types @onflow/sdk
```

2. Install Flow CLI (if not already installed):
```bash
# macOS
brew install flow-cli

# Windows
# Download from https://github.com/onflow/flow-cli/releases

# Linux
curl -sL https://storage.googleapis.com/flow-cli/install.sh | sh
```

## Configuration

1. **Update Flow Configuration**
   - Edit `flow.json` with your account details
   - Update contract addresses in `src/flow-config.ts` after deployment

2. **Set up Flow Account**
   - Create a Flow account using [Flow Faucet](https://testnet-faucet.onflow.org/)
   - Update the account details in `flow.json`

## Deployment Steps

### 1. Local Emulator (Development)

```bash
# Start Flow emulator
flow emulator start

# Deploy to emulator
flow deploy --network emulator

# Verify deployment
flow contracts get --network emulator
```

### 2. Testnet Deployment

```bash
# Configure testnet
flow config set accessNode.api https://rest-testnet.onflow.org

# Deploy to testnet
flow deploy --network testnet

# Verify deployment
flow contracts get --network testnet
```

### 3. Mainnet Deployment

```bash
# Configure mainnet
flow config set accessNode.api https://rest-mainnet.onflow.org

# Deploy to mainnet
flow deploy --network mainnet

# Verify deployment
flow contracts get --network mainnet
```

## Using the Deployment Script

You can also use the TypeScript deployment script:

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run deployment script
npx ts-node scripts/deploy-flow.ts
```

## Contract Addresses

After deployment, update these addresses in your configuration:

- **Testnet**: Update `flowConfig.testnet.contractAddress` in `src/flow-config.ts`
- **Mainnet**: Update `flowConfig.mainnet.contractAddress` in `src/flow-config.ts`

## Testing the Contract

1. **Initialize Flow Client**:
```typescript
import { initializeFlow } from './src/flow-config';
initializeFlow('testnet'); // or 'mainnet'
```

2. **Interact with Contract**:
```typescript
import { FlowService } from './src/services/flowService';

// Create a challenge
const result = await FlowService.createChallenge(
  "Web3 Challenge",
  "Frontend",
  86400, // 1 day in seconds
  ["0x123...", "0x456..."],
  ["Milestone 1", "Milestone 2"],
  [100, 200],
  50
);
```

## Flow vs Ethereum Differences

| Feature | Ethereum (Solidity) | Flow (Cadence) |
|---------|---------------------|----------------|
| Language | Solidity | Cadence |
| Gas Fees | Yes | No |
| Resource Model | No | Yes |
| Type Safety | Basic | Advanced |
| Upgradeability | Complex | Built-in |

## Key Benefits of Flow

1. **No Gas Fees** - Transactions are free
2. **Resource-Oriented** - Better security model
3. **Type Safety** - Compile-time error checking
4. **Upgradeable Contracts** - Built-in upgrade mechanism
5. **Developer Experience** - Better tooling and documentation

## Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check Flow CLI version
   - Verify account has sufficient FLOW tokens
   - Check contract syntax

2. **Transaction Fails**
   - Verify user has FLOW token vault
   - Check transaction arguments
   - Ensure user is authenticated

3. **Configuration Issues**
   - Verify network endpoints
   - Check contract addresses
   - Ensure proper imports

### Getting Help

- [Flow Documentation](https://docs.onflow.org/)
- [Flow Discord](https://discord.gg/flow)
- [Flow Forum](https://forum.onflow.org/)

## Next Steps

1. **Test the Contract** - Use the emulator for development
2. **Deploy to Testnet** - Test with real Flow tokens
3. **Audit the Contract** - Consider security review
4. **Deploy to Mainnet** - Production deployment
5. **Monitor and Maintain** - Regular updates and monitoring

## Security Considerations

- Always test on testnet first
- Use proper access control
- Implement proper error handling
- Consider formal verification
- Regular security audits

## License

This project is licensed under the MIT License.

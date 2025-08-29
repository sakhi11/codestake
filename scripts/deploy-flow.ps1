# Flow Contract Deployment Script for Windows
# This script helps deploy the CodeStake contract to Flow blockchain

param(
    [string]$Network = "testnet",
    [string]$AccountKey = "",
    [string]$AccountAddress = ""
)

Write-Host "🚀 CodeStake Flow Contract Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if required parameters are provided
if (-not $AccountKey -or -not $AccountAddress) {
    Write-Host "❌ Error: Account key and address are required" -ForegroundColor Red
    Write-Host "Usage: .\deploy-flow.ps1 -Network testnet -AccountKey <key> -AccountAddress <address>" -ForegroundColor Yellow
    exit 1
}

# Set network configuration
$NetworkConfig = @{
    "testnet" = @{
        "accessNode" = "https://rest-testnet.onflow.org"
        "discoveryWallet" = "https://fcl-discovery.onflow.org/testnet/authn"
    }
    "mainnet" = @{
        "accessNode" = "https://rest-mainnet.onflow.org"
        "discoveryWallet" = "https://fcl-discovery.onflow.org/mainnet/authn"
    }
}

if (-not $NetworkConfig.ContainsKey($Network)) {
    Write-Host "❌ Error: Invalid network. Use 'testnet' or 'mainnet'" -ForegroundColor Red
    exit 1
}

$Config = $NetworkConfig[$Network]

Write-Host "📡 Network: $Network" -ForegroundColor Cyan
Write-Host "🔗 Access Node: $($Config.accessNode)" -ForegroundColor Cyan
Write-Host "👤 Account Address: $AccountAddress" -ForegroundColor Cyan

# Create flow.json configuration
$FlowConfig = @{
    networks = @{
        $Network = $Config.accessNode
    }
    accounts = @{
        "deployer-account" = @{
            address = $AccountAddress
            key = $AccountKey
        }
    }
    contracts = @{
        "CodeStake" = "./flow-contracts/CodeStake.cdc"
    }
    deployments = @{
        $Network = @{
            "deployer-account" = @("CodeStake")
        }
    }
} | ConvertTo-Json -Depth 10

# Write flow.json
$FlowConfig | Out-File -FilePath "flow.json" -Encoding UTF8
Write-Host "✅ Created flow.json configuration" -ForegroundColor Green

# Check if contract file exists
$ContractPath = "flow-contracts/CodeStake.cdc"
if (-not (Test-Path $ContractPath)) {
    Write-Host "❌ Error: Contract file not found at $ContractPath" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Contract file found: $ContractPath" -ForegroundColor Green

# Display deployment instructions
Write-Host ""
Write-Host "📋 Deployment Instructions:" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Install Flow CLI:" -ForegroundColor White
Write-Host "   Download from: https://github.com/onflow/flow-cli/releases" -ForegroundColor Gray
Write-Host "   Extract to a folder and add to PATH" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy the contract:" -ForegroundColor White
Write-Host "   flow deploy --network $Network" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Verify deployment:" -ForegroundColor White
Write-Host "   flow contracts get --network $Network" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Update contract address in src/flow-config.ts" -ForegroundColor White
Write-Host ""

# Alternative deployment using Node.js
Write-Host "🔄 Alternative: Deploy using Node.js script" -ForegroundColor Yellow
Write-Host "Run: npx ts-node scripts/deploy-flow.ts" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Setup complete! Follow the deployment instructions above." -ForegroundColor Green
Write-Host "📚 For more help, visit: https://docs.onflow.org/" -ForegroundColor Blue

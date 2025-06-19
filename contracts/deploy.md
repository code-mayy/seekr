# Escrow Smart Contract Deployment Guide

## Prerequisites

1. **Install Node.js and npm**
2. **Install Hardhat**:
   ```bash
   npm install --save-dev hardhat
   npx hardhat
   ```

3. **Install dependencies**:
   ```bash
   npm install --save-dev @nomicfoundation/hardhat-toolbox
   npm install --save-dev @nomiclabs/hardhat-ethers ethers
   ```

## Setup

1. **Create hardhat.config.js**:
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   require('dotenv').config();

   module.exports = {
     solidity: "0.8.19",
     networks: {
       mumbai: {
         url: "https://rpc-mumbai.maticvigil.com/",
         accounts: [process.env.PRIVATE_KEY]
       }
     },
     etherscan: {
       apiKey: process.env.POLYGONSCAN_API_KEY
     }
   };
   ```

2. **Create .env file**:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
   ```

3. **Create deployment script** (`scripts/deploy.js`):
   ```javascript
   const hre = require("hardhat");

   async function main() {
     const [deployer] = await hre.ethers.getSigners();
     
     console.log("Deploying contracts with the account:", deployer.address);
     console.log("Account balance:", (await deployer.getBalance()).toString());

     // Deploy Escrow contract
     const platformWallet = deployer.address; // Use deployer as platform wallet for demo
     const Escrow = await hre.ethers.getContractFactory("Escrow");
     const escrow = await Escrow.deploy(platformWallet);

     await escrow.deployed();

     console.log("Escrow contract deployed to:", escrow.address);
     console.log("Platform wallet:", platformWallet);
     
     // Verify contract on Polygonscan
     if (hre.network.name === "mumbai") {
       console.log("Waiting for block confirmations...");
       await escrow.deployTransaction.wait(6);
       
       try {
         await hre.run("verify:verify", {
           address: escrow.address,
           constructorArguments: [platformWallet],
         });
       } catch (error) {
         console.log("Verification failed:", error.message);
       }
     }
   }

   main()
     .then(() => process.exit(0))
     .catch((error) => {
       console.error(error);
       process.exit(1);
     });
   ```

## Deployment Steps

1. **Get Mumbai MATIC**:
   - Visit: https://faucet.polygon.technology/
   - Connect your wallet and request test MATIC

2. **Deploy the contract**:
   ```bash
   npx hardhat run scripts/deploy.js --network mumbai
   ```

3. **Update the contract address**:
   - Copy the deployed contract address from the console output
   - Update `ESCROW_CONTRACT_ADDRESS` in `src/hooks/useEscrow.ts`

4. **Verify deployment**:
   - Visit: https://mumbai.polygonscan.com/
   - Search for your contract address
   - Verify the contract is deployed and verified

## Testing

1. **Run local tests**:
   ```bash
   npx hardhat test
   ```

2. **Test on Mumbai**:
   - Use the frontend to create escrow transactions
   - Monitor transactions on Mumbai Polygonscan
   - Test all functions: create, confirm delivery, refund, dispute

## Important Notes

- **Security**: Never commit your private key to version control
- **Gas Fees**: Mumbai testnet requires MATIC for gas fees
- **Contract Address**: Update the frontend with your deployed contract address
- **Platform Fee**: Default is 2.5%, can be updated by contract owner
- **Verification**: Contract verification on Polygonscan enables better interaction

## Useful Links

- **Mumbai Faucet**: https://faucet.polygon.technology/
- **Mumbai Explorer**: https://mumbai.polygonscan.com/
- **Hardhat Documentation**: https://hardhat.org/docs
- **Polygon Documentation**: https://docs.polygon.technology/

## Contract Features

- ✅ Secure escrow with smart contract protection
- ✅ Automatic fund release on delivery confirmation
- ✅ Refund mechanism for overdue deliveries
- ✅ Dispute resolution system
- ✅ Platform fee collection
- ✅ Event logging for transparency
- ✅ Gas-optimized operations
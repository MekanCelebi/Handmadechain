// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/HandmadeNFT.sol";

contract DeployScript is Script {
    function run() public {
        // Get deployer's private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get Sepolia RPC URL
        string memory rpcUrl = vm.envString("SEPOLIA_RPC_URL");
        
        // Get Alchemy API Key
        string memory alchemyApiKey = vm.envString("ALCHEMY_API_KEY");
        
        // Get Pinata API Keys
        string memory pinataApiKey = vm.envString("PINATA_API_KEY");
        string memory pinataSecretKey = vm.envString("PINATA_SECRET_KEY");
        
        // Get Etherscan API Key
        string memory etherscanApiKey = vm.envString("ETHERSCAN_API_KEY");
        
        console.log("Starting deployment...");
        console.log("RPC URL:", rpcUrl);
        console.log("Deployer Address:", vm.addr(deployerPrivateKey));
        
        // Start deployment
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contract
        console.log("Deploying HandmadeNFT contract...");
        HandmadeNFT nft = new HandmadeNFT();
        
        vm.stopBroadcast();
        
        // Print deployed contract address
        console.log("\n=== Deployment Info ===");
        console.log("HandmadeNFT deployed to:", address(nft));
        console.log("Transaction Hash:", vm.getTxHash());
        
        // Print frontend environment variables
        console.log("\n=== Frontend .env Variables ===");
        console.log("VITE_CONTRACT_ADDRESS=", address(nft));
        console.log("VITE_ALCHEMY_API_KEY=", alchemyApiKey);
        console.log("VITE_PINATA_API_KEY=", pinataApiKey);
        console.log("VITE_PINATA_SECRET_KEY=", pinataSecretKey);
        
        // Print Etherscan verification info
        console.log("\n=== Etherscan Verification Info ===");
        console.log("Etherscan API Key:", etherscanApiKey);
        console.log("Contract Address:", address(nft));
        console.log("Verification command:");
        console.log("forge verify-contract", address(nft), "src/HandmadeNFT.sol:HandmadeNFT --chain-id 11155111 --watch");
    }
} 
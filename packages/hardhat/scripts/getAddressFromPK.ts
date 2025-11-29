import { ethers } from "ethers";

async function main() {
  const privateKey = process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.log("❌ Please set __RUNTIME_DEPLOYER_PRIVATE_KEY environment variable");
    console.log("Usage: __RUNTIME_DEPLOYER_PRIVATE_KEY=your_private_key yarn hardhat run scripts/getAddressFromPK.ts");
    return;
  }

  try {
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;

    console.log("✅ Wallet Address:", address);
    console.log("\n📋 Use this address to:");
    console.log("   1. Check balance on Monad Testnet");
    console.log("   2. Get testnet MON from faucet (if available)");
    console.log("   3. View on explorer: https://testnet.monadvision.com/address/" + address);
  } catch (error: any) {
    console.error("❌ Invalid private key:", error.message);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

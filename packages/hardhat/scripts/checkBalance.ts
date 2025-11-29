import { ethers } from "ethers";
import { config } from "hardhat";

async function main() {
  const privateKey = process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.log("❌ Please set __RUNTIME_DEPLOYER_PRIVATE_KEY environment variable");
    console.log(
      "Usage: __RUNTIME_DEPLOYER_PRIVATE_KEY=your_private_key yarn hardhat run scripts/checkBalance.ts --network monadTestnet",
    );
    return;
  }

  const wallet = new ethers.Wallet(privateKey);
  const address = wallet.address;
  console.log("📋 Account Address:", address, "\n");

  // Check balance on Monad Testnet
  const monadTestnet = config.networks?.monadTestnet;
  if (!monadTestnet || !("url" in monadTestnet)) {
    console.log("❌ Monad Testnet not configured");
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(monadTestnet.url);
    const balance = await provider.getBalance(address);
    const balanceInMon = ethers.formatEther(balance);

    console.log("🌐 Network: Monad Testnet");
    console.log("💰 Balance:", balanceInMon, "MON");
    console.log("📊 Balance (Wei):", balance.toString());

    if (balance === 0n) {
      console.log("\n⚠️  Your account has 0 MON. You need MON to deploy contracts.");
      console.log("💡 To get testnet MON:");
      console.log("   1. Check if Monad Testnet has a faucet");
      console.log("   2. Visit: https://testnet.monadvision.com");
      console.log("   3. Or ask in Monad Discord/Telegram for testnet tokens");
    } else {
      console.log("\n✅ You have sufficient balance to deploy!");
    }
  } catch (error: any) {
    console.error("❌ Error checking balance:", error.message);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

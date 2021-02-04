const { ethers } = require("ethers");

async function main() {
  // Configure the ITX provider using your Infura credentials
  const itx = new ethers.providers.InfuraProvider(
    process.env.ETHEREUM_NETWORK,
    process.env.INFURA_PROJECT_ID
  );

  // Create a signer instance based on your private key
  const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, itx);
  console.log(`Signer public address: ${signer.address}`);

  // Check your existing ITX balance
  // balance is added by sending eth to the deposit address: 0x015C7C7A7D65bbdb117C573007219107BD7486f9
  // balance is deducted everytime you send a relay transaction
  const balance = await itx.send("relay_getBalance", [signer.address]);
  console.log(`Current ITX balance: ` + ethers.utils.formatEther(balance));
}

require("dotenv").config();
main();

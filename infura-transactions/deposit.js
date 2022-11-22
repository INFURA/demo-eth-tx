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

  // Send Ether to the ITX deposit contract
  // ITX will register the deposit after 10 confirmations
  // and credit the gas tank associated with your signer address
  // you can view your balance at any time by calling relay_getBalance
  const depositTx = await signer.sendTransaction({
    // Address of the ITX deposit contract
    to:"0x972aF4d227A29642aA993741f4718d463569E4b3",
    // The amount of ether you want to deposit in your ITX gas tank
    value: ethers.utils.parseUnits("1.0", "ether"),
  });
  console.log("Mining deposit transaction...");
  console.log(
    `https://${process.env.ETHEREUM_NETWORK}.etherscan.io/tx/${depositTx.hash}`
  );

  // Waiting for the transaction to be mined
  const receipt = await depositTx.wait();

  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`);
}

require("dotenv").config();
main();

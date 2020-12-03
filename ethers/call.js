const { ethers } = require('ethers');

// Loading the contract ABI
// (the results of a previous compilation step)
const fs = require('fs');
const { abi } = JSON.parse(fs.readFileSync('Demo.json'));

async function main() {
  // Configuring the connection to an Ethereum node
  const provider = new ethers.providers.InfuraProvider(
    process.env.ETHEREUM_NETWORK,
    process.env.INFURA_PROJECT_ID
  );

  // Creating a signing account from a private key
  const signer = new ethers.Wallet(
    '0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122',
    provider
  );

  // Creating a Contract instance connected to the signer
  const contract = new ethers.Contract(
    // Replace this with the address of your deployed contract
    '0x5191aA68c7dB195181Dd2441dBE23A48EA24b040',
    abi,
    signer
  );

  // Issuing a transaction that calls the `echo` method
  const tx = await contract.echo('Hello, world!');
  console.log('Mining transaction...');
  console.log(
    `https://${process.env.ETHEREUM_NETWORK}.etherscan.io/tx/${tx.hash}`
  );

  // Waiting for the transaction to be mined
  const receipt = await tx.wait();

  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`);
}

require('dotenv').config();
main();

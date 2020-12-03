const { ethers } = require('ethers');

// Loading the contract ABI and Bytecode
// (the results of a previous compilation step)
const fs = require('fs');
const { abi, bytecode } = JSON.parse(fs.readFileSync('Demo.json'));

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

  // Using the signing account to deploy the contract
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  console.log('Mining transaction...');
  console.log(
    `https://${process.env.ETHEREUM_NETWORK}.etherscan.io/tx/${contract.deployTransaction.hash}`
  );

  // Waiting for the transaction to be mined
  await contract.deployTransaction.wait();

  // The contract is now deployed on chain!
  console.log(`Contract deployed at ${contract.address}`);
}

require('dotenv').config();
main();

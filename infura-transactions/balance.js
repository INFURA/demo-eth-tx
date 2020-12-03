const { ethers } = require('ethers');

async function main() {
  // Make sure we're on the right network
  if (process.env.ETHEREUM_NETWORK !== 'rinkeby') {
    console.log('ITX currently only available on Rinkeby network');
    process.exit(1);
  }

  // Configure the ITX provider using your Infura credentials
  const itx = new ethers.providers.InfuraProvider(
    process.env.ETHEREUM_NETWORK,
    process.env.INFURA_PROJECT_ID
  );

  // Create a signer instance based on your private key
  const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, itx);
  console.log(`Signer public address: ${signer.address}`);

  // Check your existing ITX balance
  const balance = await itx.send('relay_getBalance', [signer.address]);
  console.log(`Current ITX balance: ${balance}`);
}

require('dotenv').config();
main();

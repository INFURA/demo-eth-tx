const { ethers } = require('ethers');

async function main() {
  // Make sure we're on the right network
  if (process.env.ETHEREUM_NETWORK !== 'rinkeby') {
    console.log('ITX currently only available on Rinkeby network');
    process.exit(1);
  }

  // Configuring the connection to an Ethereum node
  const itx = new ethers.providers.InfuraProvider(
    process.env.ETHEREUM_NETWORK,
    process.env.INFURA_PROJECT_ID
  );

  // Creating a signing account from a private key
  const signer = new ethers.Wallet(
    '0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122',
    itx
  );

  const balance = await itx.send('relay_getBalance', [signer.address]);
  console.log(`The current ITX balance for ${signer.address} is ${balance}`);
}

require('dotenv').config();
main();

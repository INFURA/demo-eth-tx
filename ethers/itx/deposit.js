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

  // Sending Ether to the ITX deposit contract
  // (this will be registered as a deposit from the signing account address)
  const depositTx = await signer.sendTransaction({
    to: '0x015C7C7A7D65bbdb117C573007219107BD7486f9',
    value: ethers.utils.parseUnits('0.1', 'ether'),
  });
  console.log('Mining deposit transaction...');
  console.log(`https://${process.env.ETHEREUM_NETWORK}.etherscan.io/tx/${depositTx.hash}`);

  // Waiting for the transaction to be mined
  const receipt = await depositTx.wait();

  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`);
}

require('dotenv').config();
main();

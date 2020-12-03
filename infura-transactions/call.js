const { ethers } = require('ethers');

// Loading the contract ABI
// (the results of a previous compilation step)
const fs = require('fs');
const { abi } = JSON.parse(fs.readFileSync('Demo.json'));

const wait = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  // Make sure we're using the right network
  if (process.env.ETHEREUM_NETWORK !== 'rinkeby') {
    console.log('ITX currently only available on Rinkeby network');
    process.exit(1);
  }

  // Configure the connection to an Ethereum node
  const itx = new ethers.providers.InfuraProvider(
    process.env.ETHEREUM_NETWORK,
    process.env.INFURA_PROJECT_ID
  );

  // Create a signing account from a private key
  const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, itx);

  // Create a contract interface
  const iface = new ethers.utils.Interface(abi);

  // Create the transaction relay request
  const tx = {
    // Address of the contract we want to call
    to: '0x35A2624888e207e4B3434E9a9E250bF6Ee68FeA3',
    // Encoded data payload representing the contract method call
    data: iface.encodeFunctionData('echo', [`Hello world at ${Date.now()}!`]),
    // An upper limit on the gas we're willing to spend
    gas: '100000',
  };

  // Sign a relay request using the signer's private key
  // Final signature of the form keccak256("\x19Ethereum Signed Message:\n" + len((to + data + gas + chainId)) + (to + data + gas + chainId)))
  // Where (to + data + gas + chainId) represents the RLP encoded concatenation of these fields.
  // ITX will check the from address of this signature and deduct balance according to the gas used by the transaction
  const relayTransactionHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'bytes', 'uint', 'uint'],
      [tx.to, tx.data, tx.gas, 4] // Rinkeby chainId is 4
    )
  );
  const signature = await signer.signMessage(ethers.utils.arrayify(relayTransactionHash));

  // Relay the transaction through ITX
  const relayTransactionHash = await itx.send('relay_sendTransaction', [tx, signature]);
  console.log(`ITX relay transaction hash: ${relayTransactionHash}`);

  // Waiting for the corresponding Ethereum transaction to be mined
  // We poll the relay_getTransactionStatus method for status updates
  // ITX bumps the gas price of your transaction until it's mined,
  // causing a new transaction hash to be created each time it happens.
  // relay_getTransactionStatus returns a list of these transaction hashes
  // which can then be used to poll Infura for their transaction receipts
  console.log('Waiting to be mined...');
  while (true) {
    // fetch the latest ethereum transaction hashes
    const statusResponse = await itx.send('relay_getTransactionStatus', [relayTransactionHash]);

    // check each of these hashes to see if their receipt exists and
    // has confirmations
    for (let i = 0; i < statusResponse.length; i++) {
      const hashes = statusResponse[i];
      const receipt = await itx.getTransactionReceipt(hashes['ethTxHash']);
      if (receipt && receipt.confirmations && receipt.confirmations > 1) {
        // The transaction is now on chain!
        console.log(`Ethereum transaction hash: ${receipt.transactionHash}`);
        console.log(`Mined in block ${receipt.blockNumber}`);
        return;
      }
    }
    await wait(1000);
  }
}

require('dotenv').config();
main();

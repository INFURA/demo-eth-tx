const Web3 = require('web3');

async function main() {
  // Configuring the connection to an Ethereum node
  const network = 'rinkeby';
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    )
  );
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    '0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122'
  );
  web3.eth.accounts.wallet.add(signer);
  // Creating the transaction object
  const tx = {
    from: signer.address,
    to: '0xeAD9C93b79Ae7C1591b1FB5323BD777E86e150d4',
    value: web3.utils.toWei('0.001'),
  };
  // Assigning the right amount of gas
  tx.gas = await web3.eth.estimateGas(tx);

  // Sending the transaction to the network
  const receipt = await web3.eth
    .sendTransaction(tx)
    .once('transactionHash', txhash => {
      console.log(`Mining transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`);
}

require('dotenv').config();
main();

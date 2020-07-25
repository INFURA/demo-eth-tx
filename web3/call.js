const Web3 = require('web3');

// Loading the contract ABI
// (the results of a previous compilation step)
const fs = require('fs');
const { abi } = JSON.parse(fs.readFileSync('Demo.json'));

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
  // Creating a Contract instance
  const contract = new web3.eth.Contract(
    abi,
    // Replace this with the address of your deployed contract
    '0x0C6c3C47A1f650809B0D1048FDf9603e09473D7E'
  );
  // Issuing a transaction that calls the `echo` method
  const tx = contract.methods.echo('Hello, world!');
  const receipt = await tx
    .send({
      from: signer.address,
      gas: await tx.estimateGas(),
    })
    .once('transactionHash', txhash => {
      console.log(`Mining transaction ...`);
      console.log(`https://${network}.etherscan.io/tx/${txhash}`);
    });
  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`);
}

require('dotenv').config();
main();

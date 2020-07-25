const Web3 = require('web3')

// Loading the contract ABI and Bytecode
// (the results of a previous compilation step)
const fs = require('fs')
const { abi, bytecode } = JSON.parse(fs.readFileSync('Demo.json'))

async function main() {
  // Configuring the connection to an Ethereum node
  const network = 'rinkeby'
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    )
  )
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    '0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122'
  )
  web3.eth.accounts.wallet.add(signer)

  // Using the signing account to deploy the contract
  const contract = new web3.eth.Contract(abi)
  contract.options.data = bytecode
  const deployTx = contract.deploy()
  const deployedContract = await deployTx
    .send({
      from: signer.address,
      gas: await deployTx.estimateGas(),
    })
    .once('transactionHash', txhash => {
      console.log(`Mining deployment transaction ...`)
      console.log(`https://${network}.etherscan.io/tx/${txhash}`)
    })
  // The contract is now deployed on chain!
  console.log(`Contract deployed at ${deployedContract.options.address}`)
}

require('dotenv').config()
main()

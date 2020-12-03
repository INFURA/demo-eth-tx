# Ethereum transactions demo

You'll find here a collection of scripts that show you how to interact with Ethereum using the two most popular Javascript libraries: [web3.js](https://github.com/ethereum/web3.js/) and [ethers.js](https://github.com/ethers-io/ethers.js/).

## Prerequisites

Make sure to have [Node.js](https://nodejs.org/en/) 12+ installed and an [Infura](https://infura.io) Project ID available. Clone this repository and run:

```bash
cd demo-eth-tx/
npm install
# Add your Infura Project ID below
echo 'INFURA_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' > .env
```

## Send a simple transaction

Let's test we can send a small amount of Ether between two accounts.

> These scripts are pre-configured to use the default [Buidler](https://buidler.dev/) private keys. Be kind and don't drain the wallets so other people can use them as well to test their apps. 😊

You can find a script for doing this using the `ethers.js` library in the `ethers/send.js` file. Run it and wait for the transaction to be mined:

```bash
node ethers/send.js
```

The same script, using the `web3.js` library is located at `web3/send.js`. Run it with:

```bash
node web3/send.js
```

## Working with smart contracts

In this section we'll look into the steps required to write, deploy and interact with a smart contract.

Let's start with a simple contract (`Demo.sol`):

```solidity
contract Demo {
    event Echo(string message);

    function echo(string calldata message) external {
        emit Echo(message);
    }
}
```

This contract has a single method (called `echo`) that can be called by anyone with a `message` and emits an event that echoes the input `message`.

### Contract compilation

Before deploying the contract on the network, we need to compile it. There's a simple `compile.js` script included here to serve this purpose for now:

```bash
node compile.js
```

> **Note:** When you start building your own smart contracts, you should probably use a development suite such as [Truffle](https://github.com/trufflesuite/truffle) or [Buidler](https://github.com/nomiclabs/buidler) - these tools will make your life easier 👍

As soon as the contract is compiled, a `Demo.json` file will show up in the main directory. This file includes the contract bytecode (required for deployment) and the Application Binary Interface (ABI) required for contract interactions.

### Contract deployment

You can find the deployment scripts in `ethers/deploy.js` and `web3/deploy.js`. Run any of these to deploy your contract:

```bash
node ethers/deploy.js
# or
node web3/deploy.js
```

As soon as the deployment transaction is mined, the script will output the address of the new contract.

### Contract interaction

Now that the contract is deployed, you can interact with it. The scripts are configured to interact with an older, existing contract, but feel free to edit [this line](ethers/call.js#L23) of `ethers/call.js` or [this line](web3/call.js#L25) of `web3/call.js` and replace it with the address of your newly deployed contract.

Now you can run:

```bash
node ethers/call.js
# or
node web3/call.js
```

Congratulations! You deployed and interacted with an Ethereum smart contract. It's time for you to go build something awesome! 🚀

# Infura Transactions

This directory provides code samples for using Infura Transactions (ITX), a new service which simplifies Ethereum transaction management. ITX deals with the complexities around gas management so you don't have to, it handles all edge cases for transaction delivery and it makes sure your transactions get mined at optimal gas prices.

## Prerequisites

In order to use ITX, you need the following:

1. An Infura account

> **Note**
>
> This is an early release available for testing on the Rinkeby network and will roll out to a small group of beta testers before the official public rollout at the start of 2021. If you’d like to be considered for early ITX access, submit your request [here](https://infura.io/contact).

2. An on-chain identity (we'll call it your _signing account_). This is as simple as generating a private key you have exclusive control over. You will use the private key for authenticating your ITX transaction requests, and its corresponding public address for identifying your ITX gas tank.

## Setup

> The ITX API is implemented as a JSON-RPC extension of the standard Ethereum client interface, and the deposit system is managed by an [on-chain Ethereum contract](https://rinkeby.etherscan.io/address/0x015c7c7a7d65bbdb117c573007219107bd7486f9#code). This means you can work with ITX using your favourite programming language and web3 framework. The code samples in this demo are written in Javascript using the `ethers.js` library, but you're by no means limited to these choices.

If you want to follow along with this walkthrough, make sure to have [Node.js](https://nodejs.org/en/) 12+ installed on your machine. Clone this repository and run:

```bash
cd demo-eth-tx/
npm install
```

Now let's make sure your credentials are saved in a local `.env` file so the scripts can easily access them:

```bash
# Add your Infura Project ID below
echo 'INFURA_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' >> .env

# Add your signer private key below
echo 'SIGNER_PRIVATE_KEY=0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' >> .env

# We'll be using the rinkeby network for these demos
echo 'ETHEREUM_NETWORK=rinkeby' >> .env
```

## Check your ITX balance

First, let's check if your signing account has any gas tank balance registered with ITX. You can do this by either:

- running the `balance.js` script: `node infura-transactions/balance.js`

- calling the [`relay_getBalance`](https://infura.io/docs/ethereum#operation/relay_getBalance) RPC method directly, and passing it your public signer address as a parameter.

If you have a positive gas tank balance, you're good to go - skip to the section on [Calling a smart contract](#Call-a-smart-contract). If your balance is `0` let's first top it up.

## Gas tank deposit

Setting up an ITX gas tank for your signing account is a simple process. There are several different ways to do it:

- run the `deposit.js` script: `node infura-transactions/deposit.js`

- use an Ethereum wallet (e.g. [MetaMask](https://metamask.io/)) to import your signing private key and send ETH to the [ITX deposit contract](https://rinkeby.etherscan.io/address/0x015c7c7a7d65bbdb117c573007219107bd7486f9#code).

ITX will automatically register your ETH deposit after 10 block confirmations. [Check your ITX balance](#Check-your-ITX-balance) again and, as soon as you get back a non-zero result, you're ready to send your first transaction!

## Call a smart contract

This works by sending a transaction relay request to your usual Infura endpoint using the [`relay_sendTransaction`](https://infura.io/docs/ethereum#operation/relay_sendTransaction) RPC call. ITX will first check if you have sufficient gas tank balance, then lock a portion of your funds and then relay the transaction on your behalf to the Ethereum network.

You can do this by running the `call.js` script: `node infura-transactions/call.js`

As soon as the transaction is mined and becomes part of the blockchain, the cost of the transaction which includes the network fee (gas price \* gas used) + the ITX fee, will be subtracted from your gas tank balance. You can [check your ITX gas tank balance](#Check-your-ITX-balance) at any time to monitor your spending.

And that is it! You have just sent a relay request via the ITX service.

## Transaction format

> **Important**
>
> The `from` address of the final transaction will always be set to an internal ITX wallet address (chosen by the ITX system), whereas the final `to` and `data` fields are chosen by you and defined in the original transaction request (as parameters to your `relay_sendTransaction` call).

While this approach makes it possible for ITX wallets to pay the gas for executing the transaction, you need to pay close attention to the use of `msg.sender` in the contracts you're interacting with. For every managed transaction, the contracts will see the method call as _originating from one of the ITX wallets_. The best practice for working around this challenge is to encode a [meta transaction](https://medium.com/@austin_48503/ethereum-meta-transactions-90ccf0859e84) in the `data` field of your initial request.

## Meta transactions

In many (if not most) situations, you will need to authenticate your actions with a smart contract. This is necessary if you wish to transfer an ERC20 token or to vote in a DAO. Most smart contracts authenticate the caller using `msg.sender` which is the immediate caller of the smart contract. More often than not, an Ethereum Transaction is the direct caller of the smart contract and the `msg.sender` is computed as the `from` address of the transaction.

This is problematic for third party relayers like ITX as the default Ethereum authentication mechanism (i.e., the built-in transaction signature) is now used by ITX to pay the transaction gas and the `from` address of the final transaction is not under your direct control. To solve this problem, the community have worked on the concept of a meta-transaction which requires the user to send a signed message to a smart contract before an action is executed.

> **Meta transaction compatibility with ITX**
> You can use ITX as a building block to implement _any meta transaction flow_. Your choice of on-chain authentication architecture will determine the `to` and `data` fields in your ITX transaction, but it will not impact how you interact with ITX.

At this point ITX is _fully agnostic_ of the `to` and `data` parameters it receives from you, so it will relay your transactions regardless of the meta transaction flow you decide to use.

Emerging meta transaction flows can be broken into two solutions:

- **Modify target contract.** The smart contract verifies a signed message from the user before executing the command.
- **Wallet contracts.** The user has a wallet contract that has possession of their assets. All user actions are sent via the wallet contract.

There are several solutions for modifying the target contract such as [EIP-2612's permit()](https://github.com/ethereum/EIPs/blob/32042e078c439c681d0007954286fff8d97959a1/EIPS/eip-2612.md), [EIP3009's transferWithAuthorisation()](https://eips.ethereum.org/EIPS/eip-3009) or [EIP2771's Forwarder contract.](https://github.com/ethereum/EIPs/blob/15f61ed0fda82ec86d8d6a872f6b874816f03d96/EIPS/eip-2771.md).

Generally speaking, the standards focus on how to replace `msg.sender` with an `ecrecover` that verifies the user's signed message. If the user only needs to interact with your smart contract, then it is a simple solution. However, if the user needs to interact with ERC20 tokens that are not meta-transaction compatible, then you may run into limitations still.

The wallet contract approach verifies the user's signature before executing their desired action. It is compatible with most smart contracts as the immediate caller of a target contract is the wallet contract and not the Ethereum transaction. Thus, the `msg.sender` of the target contract is the wallet contract address. There are also other benefits to wallet contracts such as batching two or more transactions together. However it does require a setup phase as the user must transfer assets to their wallet contract. You can pick any wallet contract implementation to work with ITX. We recommend GnosisSafe.

---

<br>

We hope Infura Transactions will help you build more powerful and accessible products. However, it is alpha software and we would appreciate any thoughts about it. [Get in touch](https://infura.io/contact), we'd like to hear your feedback (good or bad)!

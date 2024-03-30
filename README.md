# 🕵️‍♂️ agent smith (ETHSeoul 2024)

NextJS app for interacting with the **Agent Smith**, a multi-chain AI Agent of the NEAR matrix.

## 🤖 what is this about?

This NextJS app allows users to generate transactions by prompting in plain English for all the EVM-compatible chains and sign/send them using their NEAR wallet. This is possible thanks to:

- [NEAR Chain Signatures](https://docs.near.org/abstraction/chain-signatures) - that enable NEAR accounts, including smart contracts, to sign and execute transactions across many blockchain protocols;
- [Brian](https://docs.brianknows.org) - an web3-first AI API that generates transactions data from plain-english prompts.

## 🚀 getting started

after you've cloned this repository, you can run the following commands:

```bash
yarn install
yarn dev
```

this will start the development server at `http://localhost:3000`.

## 📦 features

- [x] Generate transactions from plain-english prompts
- [x] Sign and send transactions using NEAR wallet
- [x] Support for multiple EVM-compatible chains

### 🛠️ other developments

i've added also `typescript` support to the NEAR hooks and the services provided in the Github example repositories provided. this allowed me to have a better development experience and catch some errors at compile time.

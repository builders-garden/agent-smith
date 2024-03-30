# 🕵️‍♂️ agent smith (ETHSeoul 2024)

NextJS app for interacting with the **Agent Smith**, a multi-chain AI Agent of the NEAR matrix.

## 🤖 what is this about?

This NextJS app allows users to generate transactions by prompting in plain English for all the EVM-compatible chains and sign/send them using their NEAR wallet. This is possible thanks to:

- [NEAR Chain Signatures](https://docs.near.org/abstraction/chain-signatures) - that enable NEAR accounts, including smart contracts, to sign and execute transactions across many blockchain protocols;
- [Brian](https://docs.brianknows.org) - an web3-first AI API that generates transactions data from plain-english prompts.

## 🎯 why do i think it's cool?

interacting with several different chains at once is a **pain**: you need to have multiple wallets, multiple accounts, you need to switch between different networks every time, and this may cause a problem when interacting with AI agents like **Brian**. in fact, services like **Brian** are not able to sign transactions on their own, so you need to sign them with your wallet, and the transaction data and info are generated when you **send** the request to the AI agent: in the case of **swaps** or **crosschain swaps** this is a issue, for example, when swap rates change between the time you send the request and the time you sign the transaction.

being able to speed up the process of generating and signing transactions for multiple chains at once is a **game changer** for users that want to interact with multiple chains at once.

## 🚀 getting started

after you've cloned this repository, you can run the following command to install the dependencies:

```bash
yarn install
```

then you need to set the `.env` file and populate it with the correct values:

```bash
cp .env.example .env
```

in order to get a valid `BRIAN_API_KEY` you can enter in the [Brian App](https://brianknows.org/app) and retrieve it from the settings page. You can check more info the the [Brian Docs](https://docs.brianknows.org).

when you're done, you can run the following command to start the development server:

```bash
yarn dev
```

this will start the development server at `http://localhost:3000`.

## 📦 features

- [x] Generate transactions from plain-english prompts
- [x] Sign and send transactions using NEAR wallet
- [x] Support for multiple EVM-compatible chains

## 📚 notes

as of right now, since everything works on NEAR testnet and on Ethereum Sepolia, due to the lack of liquidity or support for operations such as swaps and bridges, I cannot test them with the signature. once this gets rolled out to production, all the logic for supporting such operations is already in place so no further work needs to be done, but it must be stated that the only operation that you can perform right now is transfering tokens.

### 🛠️ other developments

i've added also `typescript` support to the NEAR hooks and the services provided in the Github example repositories provided. this allowed me to have a better development experience and catch some errors at compile time.

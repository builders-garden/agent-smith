import { create as createStore } from "zustand";
import { distinctUntilChanged, map } from "rxjs";
import {
  Network,
  NetworkId,
  WalletSelector,
  setupWalletSelector,
} from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";

import { useEffect, useState } from "react";
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { providers } from "near-api-js";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";

type UseWalletStore = {
  signedAccountId: string;
  selector: Promise<WalletSelector> | undefined;
  setStoreSelector: (args: { selector: Promise<WalletSelector> }) => void;
  logOut: (() => Promise<void>) | undefined;
  logIn: (() => Promise<void>) | undefined;
  viewMethod:
    | ((args: {
        contractId: string;
        method: string;
        args: any;
      }) => Promise<any>)
    | undefined;
  callMethod:
    | ((args: {
        accountId: string;
        contractId: string;
        method: string;
        args: string;
        gas: string;
        deposit: string;
      }) => Promise<any>)
    | undefined;
  getTransactionResult: ((hash: string) => Promise<any>) | undefined;
  setLogActions: (args: {
    logOut: (() => Promise<void>) | undefined;
    logIn: (() => Promise<void>) | undefined;
  }) => void;
  setAuth: (args: { signedAccountId: string }) => void;
  setMethods: (args: {
    viewMethod:
      | ((args: {
          contractId: string;
          method: string;
          args: any;
        }) => Promise<any>)
      | undefined;
    callMethod:
      | ((args: {
          accountId: string;
          contractId: string;
          method: string;
          args: string;
          gas: string;
          deposit: string;
        }) => Promise<any>)
      | undefined;
    getTransactionResult: ((hash: string) => Promise<any>) | undefined;
  }) => void;
};

export const useWallet = createStore<UseWalletStore>((set) => ({
  signedAccountId: "",
  logOut: undefined,
  logIn: undefined,
  selector: undefined,
  viewMethod: undefined,
  callMethod: undefined,
  getTransactionResult: undefined,
  setLogActions: ({ logOut, logIn }) => set({ logOut, logIn }),
  setAuth: ({ signedAccountId }) => set({ signedAccountId }),
  setStoreSelector: ({ selector }) => set({ selector }),
  setMethods: ({ viewMethod, callMethod, getTransactionResult }) =>
    set({ viewMethod, callMethod, getTransactionResult }),
}));

type UseInitWalletProps = {
  createAccessKeyFor: string;
  networkId: NetworkId | Network;
};

export function useInitWallet({
  createAccessKeyFor,
  networkId,
}: UseInitWalletProps) {
  const setAuth = useWallet((store) => store.setAuth);
  const setLogActions = useWallet((store) => store.setLogActions);
  const setStoreSelector = useWallet((store) => store.setStoreSelector);
  const setMethods = useWallet((store) => store.setMethods);
  const [selector, setSelector] = useState<Promise<WalletSelector> | undefined>(
    undefined
  );

  useEffect(() => {
    const selector = setupWalletSelector({
      network: networkId,
      modules: [
        setupSender(),
        setupMeteorWallet(),
        // setupMeteorWallet(),
        setupMintbaseWallet({
          callbackUrl: "https://agent-smith.builders.garden/success",
          successUrl: "https://agent-smith.builders.garden/success",
          failureUrl: "https://agent-smith.builders.garden/error",
        }),
        setupMyNearWallet(),
        setupHereWallet(),
      ],
    });

    setSelector(selector);
    setStoreSelector({ selector });
  }, [networkId, setStoreSelector]);

  useEffect(() => {
    if (!selector) return;
    selector.then((walletSelector) => {
      console.log(walletSelector);
      const accounts = walletSelector.store.getState().accounts;
      const signedAccountId =
        accounts.find((account) => account.active)?.accountId || "";
      setAuth({ signedAccountId });

      walletSelector.store.observable
        .pipe(
          map((state) => state.accounts),
          distinctUntilChanged()
        )
        .subscribe((accounts) => {
          const signedAccountId =
            accounts.find((account) => account.active)?.accountId || "";
          setAuth({ signedAccountId });
        });
    });
  }, [selector, setAuth]);

  useEffect(() => {
    if (!selector) return;

    // defined logOut and logIn actions
    const logOut = async () => {
      const wallet = await (await selector).wallet();
      await wallet.signOut();
      setAuth({ signedAccountId: "" });
    };

    const logIn = async () => {
      const modal = setupModal(await selector, {
        contractId: createAccessKeyFor,
      });
      modal.show();
    };

    setLogActions({ logOut, logIn });

    const viewMethod = async ({
      contractId,
      method,
      args = {},
    }: {
      contractId: string;
      method: string;
      args: any;
    }) => {
      const { network } = (await selector).options;
      const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

      let res = (await provider.query({
        request_type: "call_function",
        account_id: contractId,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
        finality: "optimistic",
      })) as any;
      return JSON.parse(Buffer.from(res.result).toString());
    };

    const callMethod = async ({
      accountId,
      contractId,
      method,
      args = {},
      gas = "30000000000000",
      deposit = "0",
    }: {
      accountId: string;
      contractId: string;
      method: string;
      args: any;
      gas: string;
      deposit: string;
    }) => {
      const walletSelector = await selector;
      const wallet = await walletSelector.wallet();
      console.log(contractId, method, args, gas, deposit);
      const outcome = await wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: contractId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: method,
              args,
              gas,
              deposit,
            },
          },
        ],
      });
      console.log(outcome);
      return outcome;
    };

    const getTransactionResult = async (txHash: string) => {
      const walletSelector = await selector;
      const { network } = walletSelector.options;
      const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

      // Retrieve transaction result from the network
      const transaction = await provider.txStatus(txHash, "unnused");
      return providers.getTransactionLastResult(transaction);
    };

    setMethods({ viewMethod, callMethod, getTransactionResult });
  }, [createAccessKeyFor, selector, setAuth, setLogActions, setMethods]);
}

import { create as createStore } from "zustand";
import { distinctUntilChanged, map } from "rxjs";
import {
  Network,
  NetworkId,
  WalletSelector,
  setupWalletSelector,
} from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";

import { useEffect, useState } from "react";
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet";

type UseWalletStore = {
  signedAccountId: string;
  selector: Promise<WalletSelector> | undefined;
  setStoreSelector: (args: { selector: Promise<WalletSelector> }) => void;
  logOut: (() => Promise<void>) | undefined;
  logIn: (() => Promise<void>) | undefined;
  setLogActions: (args: {
    logOut: (() => Promise<void>) | undefined;
    logIn: (() => Promise<void>) | undefined;
  }) => void;
  setAuth: (args: { signedAccountId: string }) => void;
};

export const useWallet = createStore<UseWalletStore>((set) => ({
  signedAccountId: "",
  logOut: undefined,
  logIn: undefined,
  selector: undefined,
  setLogActions: ({ logOut, logIn }) => set({ logOut, logIn }),
  setAuth: ({ signedAccountId }) => set({ signedAccountId }),
  setStoreSelector: ({ selector }) => set({ selector }),
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
  const [selector, setSelector] = useState<Promise<WalletSelector> | undefined>(
    undefined
  );

  useEffect(() => {
    const selector = setupWalletSelector({
      network: networkId,
      modules: [setupMintbaseWallet(), setupMyNearWallet(), setupHereWallet()],
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
  }, [createAccessKeyFor, selector, setAuth, setLogActions]);
}

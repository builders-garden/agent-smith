"use client";

import { useWallet } from "@/lib/wallets/wallet-selector";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

export const Navigation = () => {
  const { signedAccountId, logOut, logIn } = useWallet();
  const [action, setAction] = useState<any>(() => {});
  const [label, setLabel] = useState<string>("Connect");

  useEffect(() => {
    if (signedAccountId) {
      setAction(() => logOut);
      setLabel(signedAccountId);
    } else {
      setAction(() => logIn);
      setLabel("Connect");
    }
  }, [signedAccountId, setAction, logIn, logOut]);

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit">
          Agent <span className="text-success">Smith</span>
        </p>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button color="success" onPress={action} variant="flat">
            {label}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

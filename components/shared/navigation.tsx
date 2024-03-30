"use client";
import { useDebounce } from "@/hooks/use-debounce";
import { useWallet } from "@/hooks/wallet-selector";
import { Eth } from "@/lib/services";
import { shortenAddress } from "@/lib/utils";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@nextui-org/react";
import { Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Navigation = () => {
  const { signedAccountId, logOut, logIn } = useWallet();
  const [action, setAction] = useState<any>(() => {});
  const [label, setLabel] = useState<string>("Connect");
  const [ethAddress, setEthAddress] = useState<string>("");
  const [derivation, setDerivation] = useState("");
  const derivationPath = useDebounce(derivation, 1000);
  console.log(signedAccountId);
  useEffect(() => {
    if (signedAccountId) {
      setAction(() => logOut);
      setLabel(signedAccountId);
    } else {
      setAction(() => logIn);
      setLabel("Connect");
    }
  }, [signedAccountId, setAction, logIn, logOut]);

  useEffect(() => {
    if (signedAccountId) {
      retrieveEthereumAddress();
    }
  }, [signedAccountId]);

  const retrieveEthereumAddress = async () => {
    const { address } = await Eth.deriveAddress(
      signedAccountId,
      derivationPath
    );
    setEthAddress(address);
  };

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <Link href={"/"} className="font-bold text-inherit">
          Agent <span className="text-success">Smith</span>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button color="success" onPress={action} variant="flat">
            {signedAccountId ? shortenAddress(signedAccountId) : label}
          </Button>
        </NavbarItem>
        {ethAddress && (
          <NavbarItem>
            <Button
              color="primary"
              onPress={() => {
                // copy to clipboard
                typeof navigator !== undefined &&
                  navigator.clipboard.writeText(ethAddress);
              }}
              startContent={<Copy size={12} />}
            >
              {shortenAddress(ethAddress)}
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};

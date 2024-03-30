"use client";

import { NetworkId } from "@/lib/config";
import { useInitWallet } from "@/lib/wallets/wallet-selector";
import { NextUIProvider } from "@nextui-org/react";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useInitWallet({ createAccessKeyFor: "", networkId: NetworkId });

  return (
    <NextUIProvider>
      <main className="min-h-screen dark bg-background text-foreground flex flex-col h-full">
        {children}
      </main>
    </NextUIProvider>
  );
}

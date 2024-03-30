import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@near-wallet-selector/modal-ui/styles.css";
import Providers from "@/components/shared/providers";
import { Navigation } from "@/components/shared/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agent Smith",
  description:
    "Perform multi-chain transactions from your NEAR wallet by prompting in English.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <>{children}</>
        </Providers>
      </body>
    </html>
  );
}

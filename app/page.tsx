"use client";
import { useWallet } from "@/hooks/wallet-selector";
import { Eth } from "@/lib/services";
import { capitalizeFirstLetter } from "@/lib/utils";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Image,
  Input,
  Link,
} from "@nextui-org/react";
import { Bot, Send } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Home() {
  const { signedAccountId, getTransactionResult, viewMethod, callMethod } =
    useWallet();
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [transactionURL, setTransactionURL] = useState<string>("");

  const sendTransaction = async () => {
    const { address } = await Eth.deriveAddress(signedAccountId, "");
    const { action, data } = response[0];

    if (action === "swap" || action === "bridge") {
      // check allowance
      // const allowance = await Eth.readContract(
      //   data.
      // );
    }

    const { transaction, payload } = await Eth.createPayload(
      address,
      data.steps[0].to,
      data.steps[0].value,
      data.steps[0].data
    );
    console.log(payload);
    const signature = await Eth.requestSignatureToMPC(
      { viewMethod, callMethod, getTransactionResult },
      "multichain-testnet-2.testnet",
      "",
      payload,
      transaction,
      address
    );
    const txHash = await Eth.relayTransaction(signature);
    setTransactionURL(`https://sepolia.etherscan.io/tx/${txHash}`);
  };

  const generateTransaction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setTransactionURL("");
    try {
      const { address } = await Eth.deriveAddress(signedAccountId, "");
      const res = await fetch("/api/brian", {
        method: "POST",
        body: JSON.stringify({ prompt, address: address }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { result } = await res.json();
      console.log(res);
      setPrompt("");
      setResponse(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center space-y-4 py-12 h-full">
      <Image
        className="mx-auto"
        radius="none"
        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmR0a3pqN2R2ODZ6c2I2eGFvanM5M2N0bnNieXJqbG1yMm9jZzBxYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LB4r67Dk0bhOU/giphy.gif"
      />
      <form
        className="flex flex-row space-x-2 w-full max-w-md"
        onSubmit={(e) => generateTransaction(e)}
      >
        <Input
          value={prompt}
          onValueChange={(val) => setPrompt(val)}
          placeholder="Transfer 1 ETH to 0x1234..."
        />
        <Button
          color="primary"
          startContent={<Send />}
          type="submit"
          isLoading={loading}
        >
          Send
        </Button>
      </form>
      {response && (
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row space-x-2">
            <div className="p-2 bg-success rounded-full">
              <Bot />
            </div>
            <h1 className="font-semibold text-lg">
              {capitalizeFirstLetter(response[0].action)}
            </h1>
          </CardHeader>
          <CardBody className="border-t-1">
            <p>
              {response[0].data.description || response[0].data[0].description}
            </p>
            <div className="w-full flex flex-row justify-end space-x-4">
              {transactionURL ? (
                <Button
                  as={Link}
                  isExternal={true}
                  href={transactionURL}
                  className="font-semibold"
                >
                  View on Explorer
                </Button>
              ) : (
                <Button
                  className="font-semibold"
                  onPress={() => sendTransaction()}
                >
                  Confirm
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </section>
  );
}

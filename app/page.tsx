"use client";
import { useWallet } from "@/hooks/wallet-selector";
import { getEthClient } from "@/lib/services";
import { capitalizeFirstLetter } from "@/lib/utils";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Image,
  Input,
  Link,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { Bot, Info, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function Home() {
  const { signedAccountId, getTransactionResult, viewMethod, callMethod } =
    useWallet();
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [transactionURL, setTransactionURL] = useState<string>("");
  const [value, setValue] = useState("11155111");
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const handleSelectionChange = (e: any) => {
    setValue(e.target.value);
  };

  const sendTransaction = async () => {
    setLoading(true);
    try {
      const Eth = getEthClient(value);
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
      setTransactionURL(
        `https://${value !== "1" ? "sepolia." : ""}etherscan.io/tx/${txHash}`
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTransaction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setShowInfo(false);
    setTransactionURL("");
    try {
      const Eth = getEthClient(value);
      const { address } = await Eth.deriveAddress(signedAccountId, "");
      const res = await fetch("/api/brian", {
        method: "POST",
        body: JSON.stringify({ prompt, address: address, chainId: value }),
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
    <section className="flex flex-col items-center space-y-4 py-12 h-full px-4">
      <Image
        className="mx-auto"
        radius="none"
        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmR0a3pqN2R2ODZ6c2I2eGFvanM5M2N0bnNieXJqbG1yMm9jZzBxYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LB4r67Dk0bhOU/giphy.gif"
      />
      <form
        className="flex flex-col space-y-4 w-full max-w-md"
        onSubmit={(e) => generateTransaction(e)}
      >
        <RadioGroup
          label="Select chain"
          orientation="horizontal"
          value={value}
          onValueChange={(val) => setValue(val)}
        >
          <Radio value="11155111">Sepolia</Radio>
          <Radio value="1">Ethereum</Radio>
        </RadioGroup>

        <div className="flex flex-row space-x-2">
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
        </div>
      </form>
      {response && (
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-row space-x-2 items-center">
              <div className="p-2 bg-success rounded-full">
                <Bot />
              </div>
              <h1 className="font-semibold text-lg">
                {capitalizeFirstLetter(response[0].action)}
              </h1>
            </div>
            <Button
              variant="flat"
              className="font-semibold"
              onClick={() => setShowInfo(!showInfo)}
              isIconOnly
              size="sm"
            >
              <Info size={16} />
            </Button>
          </CardHeader>
          <CardBody className="border-t-1">
            <p>
              {response[0].data.description || response[0].data[0].description}
            </p>
            {showInfo && (
              <ReactMarkdown
                // disallowedElements={["a"]}
                // @ts-ignore
                rehypePlugins={[rehypeRaw]}
                className="text-justify text-sm bg-stone-700 overflow-x-scroll p-4 rounded-lg my-4"
              >
                {`\`\`\`json\n${JSON.stringify(
                  response[0].data[0] ? response[0].data[0] : response[0].data,
                  null,
                  4
                )}`}
              </ReactMarkdown>
            )}
            <div className="w-full flex flex-row justify-end space-x-2 mt-2">
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
                  isLoading={loading}
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

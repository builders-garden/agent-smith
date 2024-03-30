"use client";

import { Image, Link } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const txHash = searchParams.get("transactionHashes");
  return (
    <section className="flex flex-col items-center space-y-4 py-12 h-full">
      <Image
        className="mx-auto"
        radius="none"
        src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3ZtYnV1YXFlZ2l0MGhnZXVnamNyNHVxcW1pZWJvbWdiY3hmOWdlZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7w3tBQ0vvnevzvsQS6/giphy.gif"
      />
      <div className="max-w-md text-center w-full">
        Your transaction was successful! Check it out on the{" "}
        <Link
          href={`https://testnet.nearblocks.io/txns/${txHash}`}
          target="_blank"
        >
          explorer
        </Link>
      </div>
    </section>
  );
}

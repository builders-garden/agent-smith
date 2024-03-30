"use client";
import { Image, Link } from "@nextui-org/react";

export default function ErrorPage() {
  return (
    <section className="flex flex-col items-center space-y-4 py-12 h-full">
      <Image
        className="mx-auto"
        radius="none"
        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2t3MWtvc3hyM3IxOWxxbmI0dGZ5NTdlempvbDM1czI2ZDEzeHlmZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/twpYnBnUobHRm/giphy.gif"
      />
      <div className="max-w-md text-center w-full">
        An error occurred while performing your transaction.{" "}
        <Link href="/">Try again</Link>.
      </div>
    </section>
  );
}

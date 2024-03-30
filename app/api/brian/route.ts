import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  // get the prompt and address from the JSON request
  const { prompt, address, chainId } = await req.json();
  // instantiate the Brian SDK
  // generate the response
  const brianResponse = await fetch(
    "https://api.brianknows.org/api/v0/agent/transaction",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-brian-api-key": process.env.BRIAN_API_KEY!,
      },
      body: JSON.stringify({ prompt, address, chainId }),
    }
  );

  const txData = await brianResponse.json();

  return NextResponse.json(txData, { status: 200 });
}

import { client } from "./client";
import { runApp } from "./main";

async function main() {
  const futureConnectStatus = await client.futuresPing();
  if (!futureConnectStatus) {
    throw new Error(
      "Network connect failed. Please check your network connection."
    );
  }
  await runApp();
}

main();

import type { SendUserOperationResult } from "@alchemy/aa-core";
import { parseEther } from "viem";
import createProvider from "./createProvider";

const ADDR = "0x96Afdf14eE40A97Ac724301Edaa1c5a8b24F6a6d"; // replace with the adress you want to send SepoliaETH to, unless you want to send ETH to Vitalik :)

/**
 * @description Creates a smart contract account, and sends ETH to the specified address (could be an EOA or SCA)
 * @note Seperating the logic to create the account, and the logic to send the transaction
 */
export async function main() {
  const provider = await createProvider();
  console.log('生成されたprovider', provider)

  const amountToSend: bigint = parseEther("0.0001");

  let result: SendUserOperationResult;
  try {
    result = await provider.sendUserOperation({
      target: ADDR,
      data: "0x",
      value: amountToSend,
    });
  } catch (error) {
    console.error("sendUserOperation failed: ", error.message);
    console.error("Error URL: ", error.request?.url);
    console.error("Request body: ", JSON.stringify(error.request?.body, null, 2));
    throw error; // エラーを再スローして、呼び出し元で処理できるようにします
  }

  console.log("User operation result: ", result);

  console.log(
    "\nWaiting for the user operation to be included in a mined transaction..."
  );

  const txHash = await provider.waitForUserOperationTransaction(
    result.hash as `0x${string}`
  );

  console.log("\nTransaction hash: ", txHash);

  const userOpReceipt = await provider.getUserOperationReceipt(
    result.hash as `0x${string}`
  );

  console.log("\nUser operation receipt: ", userOpReceipt);

  const txReceipt = await provider.rpcClient.waitForTransactionReceipt({
    hash: txHash,
  });

  return txReceipt;
}

main()
  .then((txReceipt) => {
    console.log("\nTransaction receipt: ", txReceipt);
  })
  .catch((err) => {
    console.error("Error: ", err);
  })
  .finally(() => {
    console.log("\n--- DONE ---");
  });

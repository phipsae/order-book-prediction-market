"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const CreatePosition = () => {
  const [chance, setChance] = useState<string>("");
  const [ethAmount, setEthAmount] = useState(0);
  const [result, setResult] = useState<number>(0); // 0 for YES, 1 for NO

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  return (
    <div className="flex justify-center w-full">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Create Position</h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Expected Result</label>
              <select
                className="select select-bordered w-full"
                value={result}
                onChange={e => setResult(Number(e.target.value))}
              >
                <option value={0}>Yes</option>
                <option value={1}>No</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Chance (1-100%)</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                className="input input-bordered"
                placeholder="Enter chance percentage"
                value={chance}
                onChange={e => {
                  const value = e.target.value;
                  // Allow empty value or integers between 1-100
                  if (
                    value === "" ||
                    (parseInt(value) === Number(value) && Number(value) >= 1 && Number(value) <= 100)
                  ) {
                    setChance(value);
                  }
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">ETH Amount</label>
              <EtherInput
                value={ethAmount.toString()}
                onChange={(value: string) => setEthAmount(parseFloat(value) || 0)}
                placeholder="Enter ETH amount"
              />
            </div>
          </div>

          <div className="card-actions mt-4">
            <button
              className="btn btn-primary w-full"
              onClick={async () => {
                try {
                  // Validate chance is not empty
                  if (!chance) {
                    alert("Please enter a chance percentage");
                    return;
                  }

                  await writeYourContractAsync({
                    functionName: "createPosition",
                    value: parseEther(ethAmount.toString()),
                    args: [result, BigInt(parseInt(chance))],
                  });
                } catch (e) {
                  console.error("Error buying tokens:", e);
                }
              }}
            >
              Create Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

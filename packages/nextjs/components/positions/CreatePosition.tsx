"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const CreatePosition = () => {
  const [chance, setChance] = useState(0);
  const [ethAmount, setEthAmount] = useState(0);

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Create Position</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Chance (1-100%)</label>
            <input
              type="number"
              min="1"
              max="100"
              className="input input-bordered"
              placeholder="Enter chance percentage"
              value={chance}
              onChange={e => setChance(Number(e.target.value))}
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
                await writeYourContractAsync({
                  functionName: "createPosition",
                  value: parseEther(ethAmount.toString()),
                  args: [BigInt(chance)],
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
  );
};

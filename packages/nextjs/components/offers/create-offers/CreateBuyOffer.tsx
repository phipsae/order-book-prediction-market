"use client";

import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const CreateBuyOffer = () => {
  const [chance, setChance] = useState(0);
  const [tokenAmount, setTokenAmount] = useState<bigint>(BigInt(0));
  const [selectedOption, setSelectedOption] = useState<number>(0); // 0 for YES, 1 for NO

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  // Calculate ETH amount based on chance and token amount
  const { data: ethAmount, refetch: refetchEthAmount } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "calculateEthValue",
    args: [BigInt(chance), parseEther(tokenAmount.toString())],
  });

  useEffect(() => {
    refetchEthAmount();
  }, [tokenAmount, chance, refetchEthAmount]);

  if (!prediction) return null;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Create Buy Offer</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Option</label>
            <select
              className="select select-bordered w-full"
              value={selectedOption}
              onChange={e => setSelectedOption(Number(e.target.value))}
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
              className="input input-bordered"
              placeholder="Enter chance percentage"
              value={chance}
              onChange={e => setChance(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">&quot;Yes&quot; Token Amount</label>
            <EtherInput
              value={tokenAmount.toString()}
              onChange={(value: string) => setTokenAmount(BigInt(value))}
              placeholder="Enter ETH amount"
            />
          </div>
          {ethAmount && (
            <div className="alert alert-info">
              <span>You will pay: {formatEther(ethAmount)} ETH</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await writeYourContractAsync({
                  functionName: "createBuyOffer",
                  value: ethAmount,
                  args: [selectedOption, BigInt(chance)],
                });
              } catch (e) {
                console.error("Error buying tokens:", e);
              }
            }}
          >
            Create Buy Offer
          </button>
        </div>
      </div>
    </div>
  );
};

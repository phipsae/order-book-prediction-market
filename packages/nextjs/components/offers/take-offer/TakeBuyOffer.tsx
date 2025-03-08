"use client";

import { useState } from "react";
import { GiveAllowance } from "../GiveAllowance";
import { formatEther, parseEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface TakeOfferProps {
  offerId: number;
  ethAmount: bigint;
  isActive: boolean;
  tokenAmount: bigint;
}

export const TakeBuyOffer = ({ offerId, ethAmount, isActive, tokenAmount }: TakeOfferProps) => {
  const [buyAmount, setBuyAmount] = useState<string>("0");

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  const { data: offer } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "offers",
    args: [BigInt(offerId)],
  });

  const calculateEthToReceive = (tokenAmountStr: string): bigint => {
    if (!offer || !prediction) return 0n;

    const tokenAmountBigInt = parseEther(tokenAmountStr || "0");
    const chance = offer[2];
    const tokenValue = prediction[4];
    const totalEthAmount = offer[6];

    // Calculate proportional ETH based on token amount
    if (offer[4] === 0n) return 0n;

    return (tokenAmountBigInt * totalEthAmount) / offer[4];
  };

  const handleTakeOffer = async () => {
    try {
      await writeContractAsync({
        functionName: "takeBuyOffer",
        args: [BigInt(offerId), parseEther(buyAmount)],
      });
    } catch (error) {
      console.error("Error taking position:", error);
    }
  };

  const handleSetMaxAmount = () => {
    if (offer && offer[4]) {
      setBuyAmount(formatEther(offer[4]));
    }
  };

  const { data: deployedContractData } = useDeployedContractInfo({ contractName: "PredictionMarketOrderBook" });
  const contractAddress = deployedContractData?.address;

  if (!offer) return null;
  if (!isActive) return null;
  if (!prediction) return null;
  if (!tokenAmount) return null;

  // Determine if this is a Yes or No token offer
  const isYesToken = offer[8] === 0;
  const tokenType = isYesToken ? "Yes" : "No";

  // Calculate ETH to receive based on the current buyAmount
  const ethToReceive = calculateEthToReceive(buyAmount);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Amount to buy"
            className="input input-bordered input-xs w-full"
            value={buyAmount}
            onChange={e => setBuyAmount(e.target.value)}
          />
          <button className="btn btn-xs btn-outline" onClick={handleSetMaxAmount}>
            Max
          </button>
        </div>
        <div className="text-xs">ETH to receive: {formatEther(ethToReceive)} ETH</div>
        <div className="flex gap-2">
          <GiveAllowance
            tokenAddress={isYesToken ? (prediction[8] as string) : (prediction[9] as string)}
            spenderAddress={contractAddress ?? ""}
            amount={buyAmount}
            showInput={false}
          />
          <button
            className="btn btn-xs btn-primary"
            onClick={handleTakeOffer}
            disabled={parseEther(buyAmount || "0") <= 0n}
          >
            Sell {tokenType} Token
          </button>
        </div>
      </div>
    </>
  );
};

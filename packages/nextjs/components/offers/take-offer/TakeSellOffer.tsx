"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface TakeOfferProps {
  offerId: number;
  ethAmount: bigint;
  isActive: boolean;
  tokenAmount?: bigint;
}

export const TakeSellOffer = ({ offerId, ethAmount, isActive, tokenAmount }: TakeOfferProps) => {
  const [sellAmount, setSellAmount] = useState<string>("0");

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const { data: offer } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "offers",
    args: [BigInt(offerId)],
  });

  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  const calculateEthNeeded = (tokenAmountStr: string): bigint => {
    if (!offer || !prediction) return 0n;

    const tokenAmountBigInt = parseEther(tokenAmountStr || "0");
    const chance = offer[2];
    const tokenValue = prediction[4];

    // Calculate ETH needed based on token amount and chance
    return (tokenAmountBigInt * tokenValue * chance) / (BigInt(100) * BigInt(10 ** 18));
  };

  const handleTakeOffer = async () => {
    try {
      const ethNeeded = calculateEthNeeded(sellAmount);

      await writeContractAsync({
        functionName: "takeSellOffer",
        args: [BigInt(offerId)],
        value: ethNeeded,
      });
    } catch (error) {
      console.error("Error taking position:", error);
    }
  };

  const handleSetMaxAmount = () => {
    if (offer && offer[4]) {
      setSellAmount(formatEther(offer[4]));
    }
  };

  if (!isActive) return null;
  if (!offer) return null;

  const ethNeeded = calculateEthNeeded(sellAmount);
  // Determine if this is a Yes or No token offer
  const isYesToken = offer[8] === 0;
  const tokenType = isYesToken ? "Yes" : "No";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <input
          type="number"
          placeholder="Token amount to buy"
          className="input input-bordered input-xs w-full"
          value={sellAmount}
          onChange={e => setSellAmount(e.target.value)}
        />
        <button className="btn btn-xs btn-outline" onClick={handleSetMaxAmount}>
          Max
        </button>
      </div>
      <div className="text-xs">ETH needed: {formatEther(ethNeeded)} ETH</div>
      <button className="btn btn-xs btn-primary" onClick={handleTakeOffer} disabled={!ethNeeded || ethNeeded <= 0n}>
        Buy &quot;{tokenType}&quot; Token
      </button>
    </div>
  );
};

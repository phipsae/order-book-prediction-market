"use client";

import { GiveAllowance } from "../GiveAllowance";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface TakeOfferProps {
  offerId: number;
  ethAmount: bigint;
  isActive: boolean;
  tokenAmount: bigint;
}

export const TakeBuyOffer = ({ offerId, ethAmount, isActive, tokenAmount }: TakeOfferProps) => {
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  const handleTakeOffer = async () => {
    try {
      await writeContractAsync({
        functionName: "takeBuyOffer",
        args: [BigInt(offerId)],
      });
    } catch (error) {
      console.error("Error taking position:", error);
    }
  };

  const { data: deployedContractData } = useDeployedContractInfo({ contractName: "PredictionMarketOrderBook" });
  const contractAddress = deployedContractData?.address;

  if (!isActive) return null;
  if (!prediction) return null;
  if (!tokenAmount) return null;

  return (
    <>
      <div className="flex gap-2">
        <GiveAllowance
          tokenAddress={prediction[8] as string}
          spenderAddress={contractAddress ?? ""}
          amount={tokenAmount.toString()}
          showInput={false}
        />
        <button className="btn btn-xs btn-primary" onClick={handleTakeOffer} disabled={!ethAmount}>
          Take Buy Offer
        </button>
      </div>
    </>
  );
};

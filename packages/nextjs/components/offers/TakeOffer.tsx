"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface TakeOfferProps {
  offerId: number;
  ethAmount: bigint;
  isActive: boolean;
}

export const TakeOffer = ({ offerId, ethAmount, isActive }: TakeOfferProps) => {
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const handleTakeOffer = async () => {
    try {
      await writeContractAsync({
        functionName: "takeOffer",
        args: [BigInt(offerId)],
        value: ethAmount,
      });
    } catch (error) {
      console.error("Error taking position:", error);
    }
  };

  if (!isActive) return null;

  return (
    <button className="btn btn-xs btn-primary" onClick={handleTakeOffer} disabled={!ethAmount}>
      Take Offer
    </button>
  );
};

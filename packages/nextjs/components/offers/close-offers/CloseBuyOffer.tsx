"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface CloseOfferProps {
  offerId: number;
  isActive: boolean;
  isCreator: boolean;
}

export const CloseBuyOffer = ({ offerId, isActive, isCreator }: CloseOfferProps) => {
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const handleTakePosition = async () => {
    try {
      await writeContractAsync({
        functionName: "closeBuyOffer",
        args: [BigInt(offerId)],
      });
    } catch (error) {
      console.error("Error closing buy offer:", error);
    }
  };

  if (!isActive) return null;
  if (!isCreator) return null;
  return (
    <button className="btn btn-xs btn-error text-error-content" onClick={handleTakePosition}>
      Close Position
    </button>
  );
};

"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ClosePositionProps {
  positionId: number;
  isActive: boolean;
  isCreator: boolean;
}

export const ClosePosition = ({ positionId, isActive, isCreator }: ClosePositionProps) => {
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const handleTakePosition = async () => {
    try {
      await writeContractAsync({
        functionName: "closePosition",
        args: [BigInt(positionId)],
      });
    } catch (error) {
      console.error("Error taking position:", error);
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

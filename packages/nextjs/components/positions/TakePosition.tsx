"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface TakePositionProps {
  positionId: number;
  ethToMatch: bigint;
  isActive: boolean;
}

export const TakePosition = ({ positionId, ethToMatch, isActive }: TakePositionProps) => {
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const handleTakePosition = async () => {
    try {
      await writeContractAsync({
        functionName: "takePosition",
        args: [BigInt(positionId)],
        value: ethToMatch,
      });
    } catch (error) {
      console.error("Error taking position:", error);
    }
  };

  if (!isActive) return null;

  return (
    <button className="btn btn-xs btn-primary" onClick={handleTakePosition} disabled={!ethToMatch}>
      Take Position
    </button>
  );
};

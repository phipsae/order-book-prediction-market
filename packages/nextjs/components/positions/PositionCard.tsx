"use client";

import { Address } from "../scaffold-eth";
import { ClosePosition } from "./ClosePosition";
import { TakePosition } from "./TakePosition";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface PositionCardProps {
  positionId: number;
  isActive: boolean;
  userAddress: string | undefined;
}

export const PositionCard = ({ positionId, isActive, userAddress }: PositionCardProps) => {
  const { data: position, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "positions",
    args: [BigInt(positionId)],
  });

  if (isLoading) return <div>Loading...</div>;
  if (!position) return <div>No positions found...</div>;
  if (isActive !== position[6]) return null;
  const isCreator = position[1] === userAddress ? true : false;
  const isYes = position[7] === 0 ? true : false;

  return (
    <div
      className={`card bg-base-100 shadow-sm p-4 ${isYes ? "border-2 border-green-500" : "border-2 border-red-500"}`}
    >
      <div className="flex flex-wrap gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">ID:</span>
          <span>{position[0].toString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Result:</span>
          <span>{isYes ? "Yes" : "No"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Chance:</span>
          <span>{Number(position[2])}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Creator:</span>
          <span className="truncate max-w-[100px]">
            <Address address={position[1]} />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">ETH:</span>
          <span>{Number(formatEther(position[3])).toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Match ETH:</span>
          <span>{Number(formatEther(position[4])).toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Tokens:</span>
          <span>{Number(formatEther(position[5])).toFixed(4)}</span>
        </div>
        <div className={`badge badge-sm ${position[6] ? "badge-success" : "badge-error"}`}>
          {position[6] ? "Active" : "Inactive"}
        </div>
        <TakePosition positionId={positionId} ethToMatch={position[4]} isActive={position[6]} />
        <ClosePosition positionId={positionId} isActive={position[6]} isCreator={isCreator} />
      </div>
    </div>
  );
};

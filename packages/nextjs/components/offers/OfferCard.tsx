"use client";

import { Address } from "../scaffold-eth";
import { CloseOffer } from "./CloseOffer";
import { TakeOffer } from "./TakeOffer";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface OfferCardProps {
  offerId: number;
  isActive: boolean;
  userAddress: string | undefined;
}

export const OfferCard = ({ offerId, isActive, userAddress }: OfferCardProps) => {
  const { data: offer, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "offers",
    args: [BigInt(offerId)],
  });

  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  if (isLoading) return <div>Loading...</div>;
  if (!offer) return <div>No offer found...</div>;
  if (!prediction) return <div>No prediction found...</div>;
  if (isActive !== offer[4]) return null;
  const isCreator = offer[1] === userAddress ? true : false;

  //   struct Offer {
  //     uint256 id;
  //     address creator;
  //     uint256 chance;
  //     uint256 tokenAmount;
  //     bool isActive;
  // }

  const chance = offer[2];
  const tokenAmount = offer[3];
  const tokenValue = prediction[4];

  const ethAmount = (tokenAmount * tokenValue * chance) / (BigInt(100) * BigInt(10 ** 18));

  return (
    <div className="card bg-base-100 shadow-sm p-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">ID:</span>
          <span>{offer[0].toString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Creator:</span>
          <span className="truncate max-w-[100px]">
            <Address address={offer[1]} />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Chance:</span>
          <span>{Number(offer[2])}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Token Amount:</span>
          <span>{Number(formatEther(offer[3])).toFixed(4)}</span>
        </div>

        <div className={`badge badge-sm ${offer[4] ? "badge-success" : "badge-error"}`}>
          {offer[4] ? "Active" : "Inactive"}
        </div>
        <TakeOffer offerId={offerId} ethAmount={ethAmount} isActive={offer[4]} />
        <CloseOffer offerId={offerId} isActive={offer[4]} isCreator={isCreator} />
      </div>
    </div>
  );
};

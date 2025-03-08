"use client";

import { Address } from "../scaffold-eth";
import { CloseOffer } from "./close-offers/CloseOffer";
import { TakeOffer } from "./take-offer/TakeOffer";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface OfferCardProps {
  offerId: number;
  isActive: boolean;
  userAddress: string | undefined;
  isBuyOffer: boolean;
  isYes: boolean;
}

export const OfferCard = ({ offerId, isActive, userAddress, isBuyOffer, isYes }: OfferCardProps) => {
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
  if (isActive !== offer[5]) return null;
  if (isBuyOffer !== offer[7]) return null;
  // When result is 0 (YES) and isYes is true, or when result is 1 (NO) and isYes is false
  const result = Number(offer[8]) === 0 ? true : false;
  if (isYes !== result) return null;
  const isCreator = offer[1] === userAddress ? true : false;

  //   struct Offer {
  //     uint256 id;
  //     address creator;
  //     uint256 chance;
  //     uint256 initialTokenAmount; //initial token amount, do I even need this? Maybe to calculate some probabilities?
  //     uint256 outstandingTokenAmount; //token amount left to be taken
  //     bool isActive;
  //     uint256 ethAmount;
  //     bool isBuyOffer;
  //     Result result;
  // }

  const chance = offer[2];
  const tokenAmount = offer[3];
  const tokenValue = prediction[4];

  const ethAmount = (tokenAmount * tokenValue * chance) / (BigInt(100) * BigInt(10 ** 18));

  return (
    <div
      className={`card bg-base-100 shadow-sm p-4 ${isBuyOffer ? "border-2 border-green-500" : "border-2 border-red-500"}`}
    >
      <div className="flex flex-wrap gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">ID:</span>
          <span>{offer[0].toString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base-content/70">Result:</span>
          <span>{offer[8] ? "No" : "Yes"}</span>
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
          <span className="text-base-content/70">Available Token Amount:</span>
          <span>{Number(formatEther(offer[4])).toFixed(4)}</span>
        </div>

        <div className={`badge badge-sm ${offer[4] ? "badge-success" : "badge-error"}`}>
          {offer[4] ? "Active" : "Closed"}
        </div>
        <TakeOffer
          offerId={offerId}
          ethAmount={ethAmount}
          isActive={offer[5]}
          isBuyOffer={isBuyOffer}
          tokenAmount={tokenAmount}
        />
        <CloseOffer offerId={offerId} isActive={offer[5]} isCreator={isCreator} isBuyOffer={isBuyOffer} />
      </div>
    </div>
  );
};

import { TakeBuyOffer } from "./TakeBuyOffer";
import { TakeSellOffer } from "./TakeSellOffer";

interface TakeOfferProps {
  offerId: number;
  ethAmount: bigint;
  isActive: boolean;
  isBuyOffer: boolean;
  tokenAmount: bigint;
}

export const TakeOffer = ({ offerId, ethAmount, isActive, isBuyOffer, tokenAmount }: TakeOfferProps) => {
  return (
    <div>
      {isBuyOffer ? (
        <TakeBuyOffer offerId={offerId} ethAmount={ethAmount} isActive={isActive} tokenAmount={tokenAmount} />
      ) : (
        <TakeSellOffer offerId={offerId} ethAmount={ethAmount} isActive={isActive} />
      )}
    </div>
  );
};

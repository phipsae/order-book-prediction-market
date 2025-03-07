import { CloseBuyOffer } from "./CloseBuyOffer";
import { CloseSellOffer } from "./CloseSellOffer";

interface CloseOfferProps {
  offerId: number;
  isActive: boolean;
  isCreator: boolean;
  isBuyOffer: boolean;
}

export const CloseOffer = ({ offerId, isActive, isCreator, isBuyOffer }: CloseOfferProps) => {
  return (
    <div className="flex gap-2">
      {!isBuyOffer ? (
        <CloseSellOffer offerId={offerId} isActive={isActive} isCreator={isCreator} />
      ) : (
        <CloseBuyOffer offerId={offerId} isActive={isActive} isCreator={isCreator} />
      )}
    </div>
  );
};

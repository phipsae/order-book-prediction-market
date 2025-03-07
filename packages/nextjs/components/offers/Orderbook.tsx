"use client";

import { useEffect, useState } from "react";
import { CloseOffer } from "./close-offers/CloseOffer";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

type ValidEventName =
  | "BuyOfferClosed"
  | "BuyOfferCreated"
  | "BuyOfferTaken"
  | "MarketReported"
  | "OfferClosed"
  | "OwnershipTransferred"
  | "PositionClosed"
  | "PositionCreated"
  | "PositionTaken"
  | "SellOfferCreated"
  | "SellOfferTaken"
  | "WinningTokensRedeemed";

interface OrderbookProps {
  eventName: ValidEventName;
  title: string;
}

export const Orderbook = ({ eventName, title }: OrderbookProps) => {
  const { address } = useAccount();
  const [offers, setOffers] = useState<any[]>([]);

  const { data: eventOffers, isLoading } = useScaffoldEventHistory({
    contractName: "PredictionMarketOrderBook",
    eventName: eventName,
    fromBlock: 0n,
  });

  useEffect(() => {
    if (eventOffers && eventOffers.length > 0) {
      const formattedOffers = eventOffers.map(event => {
        const { args, blockNumber, transactionHash } = event;

        // Create a base object with common properties
        const baseOffer = {
          blockNumber,
          transactionHash,
        };

        // Add properties based on event type
        if ("offerId" in args) {
          // @ts-ignore - We're checking for property existence
          baseOffer.id = args.offerId;
        }

        if ("result" in args) {
          // @ts-ignore - We're checking for property existence
          baseOffer.result = args.result;
        }

        if ("creator" in args) {
          // @ts-ignore - We're checking for property existence
          baseOffer.creator = args.creator;
        }

        if ("chance" in args) {
          // @ts-ignore - We're checking for property existence
          baseOffer.chance = args.chance;
        }

        if ("amount" in args) {
          // @ts-ignore - We're checking for property existence
          baseOffer.amount = args.amount;
        }

        if ("ethAmount" in args) {
          // @ts-ignore - We're checking for property existence
          baseOffer.ethAmount = args.ethAmount;
        }

        if ("taker" in args) {
          // @ts-ignore - We're checking for property existence
          baseOffer.taker = args.taker;
        }

        return baseOffer;
      });
      setOffers(formattedOffers);
    }
  }, [eventOffers]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="bg-base-100 shadow-xl rounded-box p-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {offers.length === 0 ? (
        <div className="text-center py-4">No offers available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Result</th>
                <th>Creator</th>
                <th>Chance</th>
                <th>Amount</th>
                {eventName.includes("Taken") && <th>Taker</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer, index) => (
                <tr key={`${offer.transactionHash}-${index}`}>
                  <td>{offer.id?.toString() || "N/A"}</td>
                  <td>{offer.result === 0 ? "YES" : offer.result === 1 ? "NO" : "N/A"}</td>
                  <td>{offer.creator ? <Address address={offer.creator} /> : "N/A"}</td>
                  <td>{offer.chance?.toString() || "N/A"}%</td>
                  <td>{offer.amount?.toString() || offer.ethAmount?.toString() || "N/A"}</td>
                  {eventName.includes("Taken") && <td>{offer.taker ? <Address address={offer.taker} /> : "N/A"}</td>}
                  <td>
                    {offer.id && (
                      <CloseOffer
                        offerId={Number(offer.id)}
                        isActive={!eventName.includes("Taken")}
                        isCreator={address === offer.creator}
                        isBuyOffer={eventName.includes("Sell")}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

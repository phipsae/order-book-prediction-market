"use client";

import { useEffect, useState } from "react";
import { OfferCard } from "./OfferCard";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const OfferView = () => {
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const { address } = useAccount();
  const { data: offerId, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "s_offerId",
  });

  const [buyOffers, setBuyOffers] = useState<number[]>([]);
  const [sellOffers, setSellOffers] = useState<number[]>([]);

  useEffect(() => {
    if (!offerId) return;

    // Create array of all offer IDs
    const offerIds = Array.from({ length: Number(offerId) }, (_, i) => i);

    // We'll sort them later when we have the chance data
    setBuyOffers(offerIds);
    setSellOffers(offerIds);
  }, [offerId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Offer Overview</h2>

        <div className="tabs tabs-boxed mb-4">
          <a className={`tab ${activeTab === "active" ? "tab-active" : ""}`} onClick={() => setActiveTab("active")}>
            Active Offers
          </a>
          <a className={`tab ${activeTab === "inactive" ? "tab-active" : ""}`} onClick={() => setActiveTab("inactive")}>
            Inactive Offers
          </a>
        </div>

        {!offerId && "no offer found"}

        {offerId && offerId > 0 && (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-green-500">Buy Offers</h3>
              <div className="space-y-3">
                {[...buyOffers]
                  .sort((a, b) => a - b)
                  .map(id => (
                    <OfferCard
                      key={`buy-${id}`}
                      offerId={id}
                      isActive={activeTab === "active"}
                      userAddress={address}
                      isBuyOffer={true}
                    />
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 text-red-500">Sell Offers</h3>
              <div className="space-y-3">
                {sellOffers.map(id => (
                  <OfferCard
                    key={`sell-${id}`}
                    offerId={id}
                    isActive={activeTab === "active"}
                    userAddress={address}
                    isBuyOffer={false}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

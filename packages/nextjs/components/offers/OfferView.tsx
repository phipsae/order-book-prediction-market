"use client";

import { useState } from "react";
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

        {Array.from({ length: Number(offerId) }, (_, i) => {
          if (activeTab === "active") {
            return <OfferCard key={i} offerId={i} isActive={true} userAddress={address} isBuyOffer={true} />;
          }
          return <OfferCard key={i} offerId={i} isActive={false} userAddress={address} isBuyOffer={true} />;
        })}
      </div>
    </div>
  );
};

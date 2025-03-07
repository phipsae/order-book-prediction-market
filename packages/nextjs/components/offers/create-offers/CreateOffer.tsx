"use client";

import { useState } from "react";
import { CreateBuyOffer } from "~~/components/offers/create-offers/CreateBuyOffer";
import { CreateSellOffer } from "~~/components/offers/create-offers/CreateSellOffer";

// import { OfferView } from "~~/components/offers/OfferView";

export const CreateOffer = () => {
  const [activeTab, setActiveTab] = useState<"sell" | "buy">("sell");

  const handleTabClick = (tab: "sell" | "buy", e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="card bg-base-100 shadow-xl max-w-xl w-full">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Create Offer</h2>

          <div className="tabs tabs-boxed mb-4">
            <button
              className={`tab ${activeTab === "sell" ? "tab-active" : ""}`}
              onClick={e => handleTabClick("sell", e)}
            >
              Sell Offer
            </button>
            <button
              className={`tab ${activeTab === "buy" ? "tab-active" : ""}`}
              onClick={e => handleTabClick("buy", e)}
            >
              Buy Offer
            </button>
          </div>

          {activeTab === "sell" ? <CreateSellOffer /> : <CreateBuyOffer />}
        </div>
      </div>
    </div>
  );
};

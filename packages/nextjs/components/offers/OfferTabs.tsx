"use client";

import { useState } from "react";
import { OfferView } from "./OfferView";

export const OfferTabs = () => {
  const [activeTab, setActiveTab] = useState<"yes" | "no">("yes");

  const handleTabClick = (tab: "yes" | "no", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    setActiveTab(tab);
  };

  return (
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Offer Overview</h2>

        <div className="tabs tabs-boxed mb-4">
          <button
            type="button"
            className={`tab ${activeTab === "yes" ? "tab-active !bg-emerald-500 !text-white" : "!text-emerald-600"}`}
            onClick={e => handleTabClick("yes", e)}
          >
            Yes Offers
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "no" ? "tab-active !bg-rose-600 !text-white" : "!text-rose-600"}`}
            onClick={e => handleTabClick("no", e)}
          >
            No Offers
          </button>
        </div>

        {activeTab === "yes" ? <OfferView isYes={true} /> : <OfferView isYes={false} />}
      </div>
    </div>
  );
};

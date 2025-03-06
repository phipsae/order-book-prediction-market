"use client";

import { useState } from "react";
import { PositionCard } from "./PositionCard";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const PositionView = () => {
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const { address } = useAccount();
  const { data: positionId, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "s_positionId",
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Position Overview</h2>

        <div className="tabs tabs-boxed mb-4">
          <a className={`tab ${activeTab === "active" ? "tab-active" : ""}`} onClick={() => setActiveTab("active")}>
            Active Positions
          </a>
          <a className={`tab ${activeTab === "inactive" ? "tab-active" : ""}`} onClick={() => setActiveTab("inactive")}>
            Inactive Positions
          </a>
        </div>

        {!positionId && "no position found"}

        {Array.from({ length: Number(positionId) }, (_, i) => {
          if (activeTab === "active") {
            return <PositionCard key={i} positionId={i} isActive={true} userAddress={address} />;
          }
          return <PositionCard key={i} positionId={i} isActive={false} userAddress={address} />;
        })}
      </div>
    </div>
  );
};

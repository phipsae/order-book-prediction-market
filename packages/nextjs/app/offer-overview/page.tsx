"use client";

import type { NextPage } from "next";
import { OfferTabs } from "~~/components/offers/OfferTabs";
import { OffersOverviewExplanation } from "~~/components/offers/OffersOverviewExplanation";
import { TokenBalance } from "~~/components/offers/TokenBalance";
import { CreateOffer } from "~~/components/offers/create-offers/CreateOffer";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";
import { Redeem } from "~~/components/redeem/Redeem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const OfferOverview: NextPage = () => {
  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  if (!prediction) return <div>No prediction found...</div>;

  const isReported = prediction[7];
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Offer Overview</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex gap-6 max-w-[1400px] mx-auto">
            <div className="flex-1 min-w-[300px] max-w-[900px]">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 flex flex-col flex-grow">
                  <PredictionMarketInfo />
                </div>
                <div className="flex-1">
                  <TokenBalance />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/3">{isReported ? <Redeem /> : <CreateOffer />}</div>
                <div className="w-2/3">
                  <OfferTabs />
                </div>
              </div>
            </div>

            <div className="w-1/3 min-w-[300px] max-w-[450px]">
              <OffersOverviewExplanation />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferOverview;

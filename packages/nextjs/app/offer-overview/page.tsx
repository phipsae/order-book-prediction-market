import type { NextPage } from "next";
import { OfferTabs } from "~~/components/offers/OfferTabs";
import { OffersOverviewExplanation } from "~~/components/offers/OffersOverviewExplanation";
import { TokenBalance } from "~~/components/offers/TokenBalance";
import { CreateOffer } from "~~/components/offers/create-offers/CreateOffer";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";

const OfferOverview: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Offer Overview</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <OffersOverviewExplanation />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <PredictionMarketInfo />
              </div>
              <div className="flex-1">
                <TokenBalance />
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <OfferTabs />
              </div>
              <div className="flex-2 min-w-[300px]">
                <CreateOffer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferOverview;

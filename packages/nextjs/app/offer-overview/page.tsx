import type { NextPage } from "next";
import { OfferView } from "~~/components/offers/OfferView";
import { TokenBalance } from "~~/components/offers/TokenBalance";
import { CreateOffer } from "~~/components/offers/create-offers/CreateOffer";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";

// import { OfferView } from "~~/components/offers/OfferView";

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
          <PredictionMarketInfo />
          <TokenBalance />
          <OfferView />
          <CreateOffer />
        </div>
      </div>
    </>
  );
};

export default OfferOverview;

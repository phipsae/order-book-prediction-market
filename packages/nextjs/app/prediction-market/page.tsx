import type { NextPage } from "next";
import { OfferView } from "~~/components/offers/OfferView";
import { CreateOffer } from "~~/components/offers/create-offers/CreateOffer";
import { CreatePosition } from "~~/components/positions/CreatePosition";
import { PositionView } from "~~/components/positions/PositionView";

const PredictionMarket: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Prediction Market</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <PositionView />
          <OfferView />
          <CreatePosition />
          <CreateOffer />
        </div>
      </div>
    </>
  );
};

export default PredictionMarket;

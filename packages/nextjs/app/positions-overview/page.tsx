import type { NextPage } from "next";
import { CreatePosition } from "~~/components/positions/CreatePosition";
import { PositionView } from "~~/components/positions/PositionView";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";

const PositionsOverview: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Prediction Market</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex flex-col gap-4">
            <PredictionMarketInfo />
            <PositionView />
            <div className="max-w-2xl mx-auto w-full">
              <CreatePosition />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PositionsOverview;

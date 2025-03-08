import type { NextPage } from "next";
import { PredicitonMarketStats } from "~~/components/prediction-market/PredicitonMarketStats";
import { PredictionMarketExplanation } from "~~/components/prediction-market/PredictionMarketExplanation";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";

const PredictionMarket: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Prediction Market Overview</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <PredictionMarketInfo />
              <div className="mt-6">
                <PredicitonMarketStats />
              </div>
            </div>
            <div className="flex-1 min-w-[300px]">
              <PredictionMarketExplanation />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PredictionMarket;

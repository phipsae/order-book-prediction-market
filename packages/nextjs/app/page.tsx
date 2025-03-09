import type { NextPage } from "next";
import { TokenBalance } from "~~/components/offers/TokenBalance";
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
          <div className="flex gap-6 max-w-[1400px] mx-auto">
            <div className="flex-grow flex flex-col gap-4 max-w-[900px]">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 flex flex-col flex-grow">
                  <PredictionMarketInfo />
                </div>
                <div className="flex-1">
                  <TokenBalance />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <PredicitonMarketStats />
                </div>
              </div>
            </div>

            <div className="w-1/3 min-w-[300px] max-w-[450px]">
              <PredictionMarketExplanation />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PredictionMarket;

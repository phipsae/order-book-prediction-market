import type { NextPage } from "next";
import { TokenBalance } from "~~/components/offers/TokenBalance";
import { CreatePosition } from "~~/components/positions/CreatePosition";
import { PositionView } from "~~/components/positions/PositionView";
import { PositionsOverviewExplanation } from "~~/components/positions/PositionsOverviewExplanation";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";

const PositionsOverview: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Positions Overview</span>
          </h1>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex flex-wrap gap-6 max-w-[1400px] mx-auto">
            <div className="flex-1 min-w-[300px] max-w-[900px]">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 flex flex-col">
                  <PredictionMarketInfo />
                </div>
                <div className="flex-1">
                  <TokenBalance />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/3">
                  <CreatePosition />
                </div>
                <div className="w-2/3">
                  <PositionView />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[300px] max-w-[450px]">
              <PositionsOverviewExplanation />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PositionsOverview;

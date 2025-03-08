import type { NextPage } from "next";
import { CreatePosition } from "~~/components/positions/CreatePosition";
import { PositionView } from "~~/components/positions/PositionView";
import { PostionsOverviewExplanation } from "~~/components/positions/PostionsOverviewExplanation";
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
          <div className="flex flex-col gap-4">
            <PostionsOverviewExplanation />
            <PredictionMarketInfo />
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <PositionView />
              </div>
              <div className="flex-2 min-w-[300px]">
                <CreatePosition />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PositionsOverview;

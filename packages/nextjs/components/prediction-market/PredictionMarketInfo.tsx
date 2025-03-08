"use client";

import { ProbabilityDisplay } from "./ProbabilityDisplay";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function PredictionMarketInfo() {
  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  if (isLoading)
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
        <p className="text-base-content">Loading prediction market...</p>
      </div>
    );

  if (!prediction)
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
        <p className="text-base-content">No prediction market found</p>
      </div>
    );

  // question = QUESTION;
  // outcome1 = i_yesToken.name();
  // outcome2 = i_noToken.name();
  // oracle = i_oracle;
  // initialTokenValue = TOKEN_VALUE;
  // token1Reserve = i_yesToken.balanceOf(address(this));
  // token2Reserve = i_noToken.balanceOf(address(this));
  // isReported = s_isReported;
  // yesTokenAddress = address(i_yesToken);
  // noTokenAddress = address(i_noToken);
  // predictionMarketOwner = owner();
  // winningToken = address(s_winningToken);

  const question = prediction[0];
  const predictionOutcome1 = prediction[1];
  const predictionOutcome2 = prediction[2];
  const isReported = prediction[7];
  const yesTokenAddress = prediction[8];
  const noTokenAddress = prediction[9];
  const winningToken = prediction[10];
  const winningOption = winningToken === yesTokenAddress ? predictionOutcome1 : predictionOutcome2;

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="bg-base-200 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-base-content text-xl font-bold">{question}</p>
              <div className={`badge ${isReported ? "badge-success" : "badge-warning"}`}>
                {isReported ? "Reported" : "In Progress"}
              </div>
            </div>
            {/* <ProbabilityDisplay label="Chance" isReported={isReported} winningOption={winningOption} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

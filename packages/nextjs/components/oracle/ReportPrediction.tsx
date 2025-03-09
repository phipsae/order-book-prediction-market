"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function ReportPrediction() {
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0);
  const { address } = useAccount();

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  const handleReport = async () => {
    try {
      await writeContractAsync({
        functionName: "report",
        args: [selectedOutcome],
      });
    } catch (error) {
      console.error("Error reporting outcome:", error);
    }
  };

  if (!prediction) return null;

  const isOracle = address === prediction[3];
  const isReported = prediction[7];
  const winningToken = prediction[11];
  const optionToken1 = prediction[8];

  // Determine which outcome was reported
  const reportedOutcome = isReported
    ? winningToken === optionToken1
      ? prediction[1]
      : prediction[2]
    : "Not reported yet";

  return (
    <div className="p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Report Prediction Outcome</h2>
      {!isOracle && <p className="text-error text-center mb-4">Only the oracle can report prediction</p>}
      <div className="flex gap-4">
        <select
          className="select select-bordered flex-1"
          value={selectedOutcome}
          onChange={e => setSelectedOutcome(Number(e.target.value))}
          disabled={!isOracle || isReported}
        >
          <option value={0}>{prediction[1]}</option>
          <option value={1}>{prediction[2]}</option>
        </select>
        <button className="btn btn-primary" onClick={handleReport} disabled={!isOracle || isReported}>
          Report Outcome
        </button>
      </div>
      {isReported && (
        <p className="text-center mt-4">
          Prediction outcome reported: <span className="font-bold">{reportedOutcome}</span>
        </p>
      )}
    </div>
  );
}

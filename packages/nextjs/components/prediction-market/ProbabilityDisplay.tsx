import { useReadContract } from "wagmi";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

export function ProbabilityDisplay({
  label,
  isReported,
  winningOption,
}: {
  label?: string;
  isReported: boolean;
  winningOption?: string;
}) {
  const {
    data: positionTakenEvents,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "PredictionMarketOrderBook",
    eventName: "PositionTaken",
    fromBlock: 0n,
    watch: true,
    // filters: { positionId: 0n },
    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  const averageProbability =
    positionTakenEvents && positionTakenEvents.length > 0
      ? positionTakenEvents.reduce((acc, event) => {
          const chance = Number(event.args.chance);
          const ethAmount = Number(event.args.ethAmount);
          return acc + chance * ethAmount;
        }, 0) /
        positionTakenEvents.reduce((acc, event) => {
          return acc + Number(event.args.ethAmount);
        }, 0)
      : 0;

  return (
    <div className="bg-base-200 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{label || "Probability"}</h3>
      <div className="radial-progress text-neutral" style={{ "--value": averageProbability * 100 } as any}>
        {averageProbability.toFixed(2) + "%"}
      </div>
    </div>
  );
}

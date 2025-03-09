"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { erc20Abi } from "~~/components/constants";
import { RedeemTokenBalance } from "~~/components/redeem/RedeemTokenBalance";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function Redeem() {
  const [amountStr, setAmountStr] = useState<string>("");
  const tokenAmount = amountStr ? parseEther(amountStr) : BigInt(0);
  const { address } = useAccount();

  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketOrderBook",
  });

  const predictionOutcome1 = prediction?.[1];
  const predictionOutcome2 = prediction?.[2];
  const isReported = prediction?.[7];
  const optionToken1 = prediction?.[8];
  const winningToken = prediction?.[11];
  const tokenAddress = winningToken === optionToken1 ? prediction?.[8] : prediction?.[9];

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress as `0x${string}`,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  if (isLoading)
    return (
      <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
        <p className="text-base-content">Loading prediction market...</p>
      </div>
    );

  if (!prediction)
    return (
      <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
        <p className="text-base-content">No prediction market found</p>
      </div>
    );

  // string memory question,
  // string memory outcome1,
  // string memory outcome2,
  // address oracle,
  // uint256 initialTokenValue,
  // uint256 token1Reserve,
  // uint256 token2Reserve,
  // bool isReported,
  // address yesTokenAddress,
  // address noTokenAddress,
  // address predictionMarketOwner,
  // address winningToken

  const winningOption = winningToken === optionToken1 ? predictionOutcome1 : predictionOutcome2;

  const handleRedeem = async () => {
    try {
      await writeContractAsync({
        functionName: "redeemWinningTokens",
        args: [tokenAmount],
      });
    } catch (error) {
      console.error("Error redeeming tokens:", error);
    }
  };

  const handleMaxAmount = () => {
    if (balance) {
      setAmountStr(formatEther(balance));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
      {isReported && tokenAddress && winningOption && (
        <RedeemTokenBalance tokenAddress={tokenAddress as string} option={winningOption as string} redeem={true} />
      )}

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Amount to redeem"
            className="input input-bordered w-full pr-16"
            onChange={e => {
              // Allow decimal input by storing as string
              if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                setAmountStr(e.target.value);
              }
            }}
            value={amountStr}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-xs btn-secondary"
            onClick={handleMaxAmount}
          >
            MAX
          </button>
        </div>
        <button className="btn btn-primary" onClick={handleRedeem}>
          Redeem Tokens
        </button>
      </div>
    </div>
  );
}

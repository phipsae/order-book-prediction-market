"use client";

import { formatEther } from "viem";
import { useBalance, useReadContract } from "wagmi";
import { erc20Abi } from "~~/components/constants";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function PredicitonMarketStats() {
  // Get prediction market data
  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  // Get contract address
  const { data: deployedContractData } = useDeployedContractInfo({
    contractName: "PredictionMarketOrderBook",
  });
  const contractAddress = deployedContractData?.address;

  // Get contract ETH balance
  const { data: contractBalance } = useBalance({
    address: contractAddress,
  });

  // Extract token addresses
  const yesTokenAddress = prediction?.[8];
  const noTokenAddress = prediction?.[9];

  // Get total supply for YES token
  const { data: yesTotalSupply } = useReadContract({
    abi: erc20Abi,
    address: yesTokenAddress,
    functionName: "totalSupply",
  });

  // Get total supply for NO token
  const { data: noTotalSupply } = useReadContract({
    abi: erc20Abi,
    address: noTokenAddress,
    functionName: "totalSupply",
  });

  if (!prediction || !yesTokenAddress || !noTokenAddress) {
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-4">
        <h2 className="text-xl font-bold mb-4">Token Information</h2>
        <p>Loading token information...</p>
      </div>
    );
  }

  const tokenValue = prediction[4];

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-4">
      <h2 className="text-xl font-bold mb-4"> Prediciton Market Stats</h2>

      {/* Contract ETH Balance */}
      <div className="bg-base-200 p-4 rounded-lg mb-4">
        <h3 className="font-bold text-lg text-primary">Contract Prediction Market Info</h3>
        <div className="divider my-2"></div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total ETH Balance (to get distributed to the winning token holders):</span>
            <span className="font-medium">
              {contractBalance
                ? `${Number(formatEther(contractBalance.value)).toFixed(4)} ${contractBalance.symbol}`
                : "Loading..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span> ETH Value of Yes/No Token in case of winning:</span>
            <span className="font-medium">{tokenValue ? `${formatEther(tokenValue)} ETH` : "Loading..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Contract Address:</span>
            <span className="font-mono text-xs">
              <Address address={contractAddress} />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YES Token Info */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-success">&quot;Yes&quot; Token</h3>
          <div className="divider my-2"></div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Supply:</span>
              <span className="font-medium">
                {yesTotalSupply ? Number(formatEther(yesTotalSupply)).toFixed(4) : "0"} tokens
              </span>
            </div>
            <div className="flex justify-between">
              <span>Token Address:</span>
              <span className="font-mono text-xs truncate max-w-[150px]">
                <Address address={yesTokenAddress} />
              </span>
            </div>
          </div>
        </div>

        {/* NO Token Info */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-error">&quot;No&quot; Token</h3>
          <div className="divider my-2"></div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Supply:</span>
              <span className="font-medium">
                {noTotalSupply ? Number(formatEther(noTotalSupply)).toFixed(4) : "0"} tokens
              </span>
            </div>
            <div className="flex justify-between">
              <span>Token Address:</span>
              <span className="font-mono text-xs truncate max-w-[150px]">
                <Address address={noTokenAddress} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

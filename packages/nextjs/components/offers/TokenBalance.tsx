"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatEther } from "viem";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { erc20Abi } from "~~/components/constants";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function TokenBalance() {
  const { address } = useAccount();

  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketOrderBook",
    functionName: "prediction",
  });

  const { data: balanceYesToken, queryKey } = useReadContract({
    abi: erc20Abi,
    address: prediction?.[8],
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  const { data: balanceNoToken } = useReadContract({
    abi: erc20Abi,
    address: prediction?.[9],
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  const tokenValue = prediction?.[4];

  const selectedNetwork = useSelectedNetwork();
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: selectedNetwork.id,
    query: {
      enabled: true,
    },
  });

  const tokenBalanceValueYesToken =
    balanceYesToken && tokenValue ? (balanceYesToken * tokenValue) / BigInt(10n ** 18n) : 0n;
  const tokenBalanceValueNoToken =
    balanceNoToken && tokenValue ? (balanceNoToken * tokenValue) / BigInt(10n ** 18n) : 0n;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-row items-center gap-2">
            <h3 className="text-lg text-center font-medium flex flex-col gap-1">
              <div>
                My Token Balance of &quot;Yes&quot;:{" "}
                <span className="text-gray-700">{balanceYesToken ? formatEther(balanceYesToken) : "0"} tokens</span>
              </div>
              <div className="text-gray-700 text-sm">
                ({tokenBalanceValueYesToken ? formatEther(tokenBalanceValueYesToken) : "0"} ETH worth in case of win)
              </div>
            </h3>
          </div>

          <div className="flex flex-row items-center gap-2">
            <h3 className="text-lg text-center font-medium flex flex-col gap-1">
              <div>
                My Token Balance of &quot;No&quot;:{" "}
                <span className="text-gray-700">{balanceNoToken ? formatEther(balanceNoToken) : "0"} tokens</span>
              </div>
              <div className="text-gray-700 text-sm">
                ({tokenBalanceValueNoToken ? formatEther(tokenBalanceValueNoToken) : "0"} ETH worth in case of win)
              </div>
            </h3>
          </div>
        </div>
      </div>
    </>
  );
}

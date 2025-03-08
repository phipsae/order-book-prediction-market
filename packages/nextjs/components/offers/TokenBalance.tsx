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
          <h2 className="card-title text-2xl mb-4 text-center w-full">My Token Balances</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Yes Tokens</h3>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{balanceYesToken ? formatEther(balanceYesToken) : "0"}</span>
                <span className="text-sm text-green-600">
                  Worth {tokenBalanceValueYesToken ? formatEther(tokenBalanceValueYesToken) : "0"} ETH if Yes wins
                </span>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
              <h3 className="text-lg font-semibold text-red-700 mb-2">No Tokens</h3>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{balanceNoToken ? formatEther(balanceNoToken) : "0"}</span>
                <span className="text-sm text-red-600">
                  Worth {tokenBalanceValueNoToken ? formatEther(tokenBalanceValueNoToken) : "0"} ETH if No wins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

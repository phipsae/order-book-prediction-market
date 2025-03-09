"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import { erc20Abi } from "~~/components/constants";
import { notification } from "~~/utils/scaffold-eth";

export function GiveAllowance({
  tokenAddress,
  spenderAddress,
  amount,
  onApprovalStatusChange,
}: {
  tokenAddress: string;
  spenderAddress: string;
  amount: string;
  onApprovalStatusChange?: (isApproved: boolean) => void;
}) {
  const { writeContractAsync: approveToken } = useWriteContract();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleApprove = async () => {
    try {
      setIsLoading(true);

      const hash = await approveToken({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "approve",
        args: [spenderAddress as `0x${string}`, parseEther(amount || "0")],
      });

      // Wait for transaction confirmation
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });

      if (receipt?.status === "success") {
        notification.success("Tokens approved successfully");
        setIsApproved(true);
        if (onApprovalStatusChange) {
          onApprovalStatusChange(true);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error approving tokens:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`btn ${isApproved ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"} text-white ${isLoading ? "loading loading-xxs" : ""}`}
      onClick={handleApprove}
      disabled={isLoading || isApproved}
    >
      {isLoading ? "..." : isApproved ? "Approved" : "Approve"}
    </button>
  );
}

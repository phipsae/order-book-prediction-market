"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { erc20Abi } from "~~/components/constants";
import { notification } from "~~/utils/scaffold-eth";

export function GiveAllowance({
  tokenAddress,
  spenderAddress,
  amount = "0",
  showInput = true,
}: {
  tokenAddress: string;
  spenderAddress: string;
  amount?: string;
  showInput?: boolean;
}) {
  const [inputAmount, setInputAmount] = useState<string>("");

  const { writeContractAsync: approveToken } = useWriteContract();

  const handleApprove = async () => {
    try {
      await approveToken({
        abi: erc20Abi,
        address: tokenAddress,
        functionName: "approve",
        args: [spenderAddress, parseEther(showInput ? inputAmount || "0" : amount)],
      });
      notification.success("Tokens approved successfully");
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  };

  return (
    <div className={showInput ? "space-y-2" : ""}>
      {showInput && (
        <input
          type="number"
          placeholder="Amount to approve"
          className="input input-bordered input-sm w-full border-gray-300 focus:border-gray-500"
          value={inputAmount}
          onChange={e => setInputAmount(e.target.value)}
        />
      )}
      <button
        className={`btn btn-sm ${showInput ? "w-full" : "flex-1"} bg-gray-600 hover:bg-gray-700 text-white`}
        onClick={handleApprove}
      >
        Approve
      </button>
    </div>
  );
}

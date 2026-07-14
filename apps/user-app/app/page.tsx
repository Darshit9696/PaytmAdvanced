"use client";

import { useBalance, useIncrementBalance, useSetBalance } from "@repo/store/useBalance";

export default function () {
  const balance = useBalance();
  const setBalance = useSetBalance();
  const incrementBalance = useIncrementBalance();

  return (
    <div>
      <h1>Current balance : {balance}</h1>

      <button onClick={() => incrementBalance()}>
        Increment Balance
      </button>
    </div>
  )
}
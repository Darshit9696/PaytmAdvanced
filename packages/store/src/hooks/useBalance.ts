import { create } from "zustand";

export type BalanceState = {
  balance: number;
  setBalance: (value: number) => void;
  increment: () => void;
};

const useBalanceStore = create<BalanceState>((set : any) => ({
  balance: 0,
  setBalance: (value : any) => set({ balance: value }),
  
  increment : () => 
    set((state : any) => ({
        balance : state.balance + 100
  })) 
  
}));


export const useIncrementBalance = () =>
    useBalanceStore((state) => state.increment);

export const useBalance = () =>
  useBalanceStore((state) => state.balance);

export const useSetBalance = () =>
     useBalanceStore((state) => state.setBalance);

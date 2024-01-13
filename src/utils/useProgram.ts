import { createContext, useContext } from "react";
import { PublicKey } from '@solana/web3.js';

export interface ProgramContextState{
    lock(tokenMint: PublicKey, seed: string, vestingSchedule: any[]) : void;
    unlock(pool: PublicKey) : void;
    transferOwnership(pool: PublicKey, newOwner: PublicKey) : void;
    closePool(pool: PublicKey) : void;

    getPoolData(pool: PublicKey) : Promise<any>;
    getPoolDataWithSeed(seed: string) : Promise<any>;
    getAllPools() : Promise<any[]>;
    isPoolExist(seed: string) : Promise<boolean>;
}

export const ProgramContext = createContext<ProgramContextState>({
} as ProgramContextState)

export function useProgram() : ProgramContextState{
    return useContext(ProgramContext)
}
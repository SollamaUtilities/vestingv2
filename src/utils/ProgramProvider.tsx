import {FC, useCallback, useMemo, ReactNode } from 'react';
import { ProgramContext } from './useProgram'
import { InfoVesting, confirmOptions } from './constants'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import * as anchor from "@project-serum/anchor";
import { PublicKey, SYSVAR_CLOCK_PUBKEY, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getMint, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
import { sendTransactionWithRetry } from './utility';

export interface ProgramProviderProps{
    children : ReactNode
}

export const ProgramProvider: FC<ProgramProviderProps> = ({children}) => {
    const wallet = useWallet()
    const {publicKey}= useWallet()
    const {connection: conn} = useConnection()
    
    const [program] = useMemo(()=>{
        const provider = new anchor.AnchorProvider(conn, wallet as any, confirmOptions)
        const program =  new anchor.Program(InfoVesting.idl, InfoVesting.programId, provider)
        return [program]
    },[conn, wallet])

    const getAllPools = async() => {
        let tempPools : any[] = []
        const POOL_SIZE = 8 + 32 + 8 + 32 + 32 + 4 + 32 + 4 + 16 * 40 + 1;
        try{
            let resp = await conn.getProgramAccounts(InfoVesting.programId, {
                commitment: "max",
                dataSlice: {length: 0, offset: 0},
                filters: [{dataSize: POOL_SIZE}]
            })
            for(let item of resp){
                try{
                    let poolData = await getPoolData(item.pubkey)
                    if(poolData.balance===0) continue;
                    tempPools.push(poolData)
                }catch(err){

                }
            }
        }catch(err){
            console.log(err)
        }
        tempPools.sort(function(a: any, b: any){
            if(a.seed.toLowerCase()>b.seed.toLowerCase()) return 1;
            if(a.seed.toLowerCase()<b.seed.toLowerCase()) return -1;
            return 0;
        })
        return tempPools
    }

    const getPoolDataWithSeed = async(seed: String) => {
        const [pool,] = PublicKey.findProgramAddressSync([Buffer.from(seed)], InfoVesting.programId)
        return getPoolData(pool)
    }

    const getPoolData = async(poolAddress : PublicKey) => {
        try{
            const poolData : any = await program.account.pool.fetch(poolAddress)
            const tokenInfo = await getMint(conn, poolData.tokenMint)
            const tokenBalance = await conn.getTokenAccountBalance(poolData.tokenAccount)
            return {
                ...poolData, address: poolAddress, tokenInfo: tokenInfo, balance: Number(tokenBalance.value.amount)
            }
        }catch(err){
            return null
        }
    }

    const isPoolExist = async(seed: String) => {
        try{
            const [pool,] = PublicKey.findProgramAddressSync([Buffer.from(seed)], InfoVesting.programId)
            if((await conn.getAccountInfo(pool))==null) return false;
            return true
        }catch(err){
            return false
        }
    }

    const lock = useCallback(async(tokenMint: PublicKey, seed: string, vestingSchedule: any[])=>{
        if(vestingSchedule.length==0) throw new Error("Invalid schedule");
        let address = publicKey!;
        let instructions : TransactionInstruction[] = []
        if(seed.length===0) throw new Error("Invalid Seed")
        if(seed.length>32) throw new Error("Max seed length is 32")
        const [pool, bump] = PublicKey.findProgramAddressSync([Buffer.from(seed)], InfoVesting.programId)
        const tokenInfo = await getMint(conn, tokenMint)
        const myTokenAccount = await getAssociatedTokenAddress(tokenMint, address, true)
        const poolTokenAccount = await getAssociatedTokenAddress(tokenMint, pool, true)
        if((await conn.getAccountInfo(poolTokenAccount))==null)
            instructions.push(createAssociatedTokenAccountInstruction(address, poolTokenAccount, pool, tokenMint))
        let minTime = new Date().getTime()/1000 + 24*60*60 - 15*60
        let schedule = vestingSchedule.map((item)=>{
            let amount = Number(item.amount) * (10**tokenInfo.decimals)
            if(amount < 0) amount = 0
            let releaseTime = (new Date(item.time)).getTime()/1000
            if(releaseTime < minTime) throw new Error("At least one day lock needed")
            return {releaseTime : new anchor.BN(releaseTime), amount : new anchor.BN(amount.toString())}
        })
        const feeData : any = await program.account.feeData.fetch(InfoVesting.feeData)
        let remainingAccounts : any[] = []
        if(feeData.feeExceptionWallets.find(function(a: any){ return a.toBase58()===address.toBase58()})===undefined){
            remainingAccounts = feeData.feeData.map((item: any)=>{
                return {pubkey: item.address, isSigner: false, isWritable: true}
            })
        }
        instructions.push(program.instruction.createVesting(seed, new anchor.BN(bump), schedule,{
            accounts: {
                feeData: InfoVesting.feeData,
                owner: address,
                pool: pool,
                tokenMint: tokenMint,
                sourceAccount: myTokenAccount,
                tokenAccount: poolTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                clock: SYSVAR_CLOCK_PUBKEY
            },
            remainingAccounts: remainingAccounts
        }))
        await sendTransactionWithRetry(conn, wallet, instructions, [])
    },[wallet])

    const unlock = useCallback(async(pool: PublicKey)=>{
        let address = publicKey!;
        let instructions: TransactionInstruction[] = []
        const poolData = await getPoolData(pool)
        const destTokenAccount = await getAssociatedTokenAddress(poolData.tokenMint, address, true)
        if((await conn.getAccountInfo(destTokenAccount))==null)
            instructions.push(createAssociatedTokenAccountInstruction(address, destTokenAccount, address, poolData.tokenMint))
        instructions.push(program.instruction.unlock({
            accounts:{
                owner: address,
                pool: pool,
                tokenAccount: poolData.tokenAccount,
                destAccount: destTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                clock: SYSVAR_CLOCK_PUBKEY
            }
        }))
        await sendTransactionWithRetry(conn, wallet, instructions, [])
    },[wallet])

    const transferOwnership = useCallback(async(pool: PublicKey, newOwner: PublicKey)=>{
        let address = publicKey!
        let instructions : TransactionInstruction[] = []
        instructions.push(program.instruction.transferOwnership(newOwner,{
            accounts:{
                owner: address,
                pool: pool
            }
        }))
        await sendTransactionWithRetry(conn, wallet, instructions, [])
    },[wallet])

    const closePool = useCallback(async(pool: PublicKey)=>{
        let address = publicKey!
        let instructions : TransactionInstruction[] = []
        instructions.push(program.instruction.closePool({
            accounts:{
                owner: address,
                pool: pool
            }
        }))
        await sendTransactionWithRetry(conn, wallet, instructions, [])
    },[wallet])

    return <ProgramContext.Provider value={{
        lock,
        unlock,
        transferOwnership,
        closePool,

        getPoolData,
        getPoolDataWithSeed,
        getAllPools,
        isPoolExist,
    }}>{children}</ProgramContext.Provider>
}
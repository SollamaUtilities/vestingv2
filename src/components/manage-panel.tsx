import { useEffect, useState } from "react"
import { useProgram } from "../utils/useProgram"
import { CircularProgress, Button, Tooltip, IconButton, } from "@mui/material"
import { ContentCopyRounded as CopyIcon } from "@mui/icons-material";

import { getCurrentTime, openNotification } from '../utils/constants'
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

export default function ManagePanel(){
    const {publicKey} = useWallet()
    const { getPoolData, getPoolDataWithSeed, unlock, transferOwnership, closePool } = useProgram()

    const [vestingSeed, setVestingSeed] = useState("")
    const [poolData, setPoolData] = useState<any>(null)
    const [newOwner, setNewOwner] = useState("")
    const [isUnlocking, setIsUnlocking] = useState(false)
    const [isTransferring, setIsTransferring] = useState(false)

    useEffect(()=>{
        const interval = setInterval(()=>{getPool()}, 5000)
        return ()=>clearInterval(interval)
    }, [vestingSeed])

    useEffect(()=>{
        getPool()
    }, [vestingSeed])

    const getPool = async() => {
        setPoolData(await getPoolDataWithSeed(vestingSeed))
    }

    const getSubString = (str : String, length : number) => {
        if(str.length<=length*2) return str
        return str.substr(0,length)+"..."+str.substr(-length,length)
    }

    return <div className="manage-panel">
        <h2>Manage/Lookup Lock</h2>
        <div className="input-group">
            Lock name: <input className="normal-input" placeholder="Lock Name" onChange={(e)=>{setVestingSeed(e.target.value)}} value={vestingSeed}/> 
        </div>
        {
            poolData!=null && <>
                <div className="info-panel">
                    <div className="info-description">
                        <div className="info-name">Owner</div>
                        <div className="info-value">
                            <a rel="noreferrer" target="_blank" href={"https://solscan.io/account/"+poolData.owner.toBase58()}>{getSubString(poolData.owner.toBase58(), 6)}</a>
                            <Tooltip title="Copy" placement="top" arrow >
                                <IconButton  onClick={()=>{
                                    navigator.clipboard.writeText(poolData.owner.toBase58())
                                }}><CopyIcon sx={{fontSize:"20px", color: "rgb(118, 139, 173)"}}/></IconButton>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="info-description">
                        <div className="info-name">Token</div>
                        <div className="info-value">
                            <a rel="noreferrer" target="_blank" href={"https://solscan.io/token/"+poolData.tokenMint.toBase58()}>{getSubString(poolData.tokenMint.toBase58(), 6)}</a>
                            <Tooltip title="Copy" placement="top" arrow >
                                <IconButton  onClick={()=>{
                                    navigator.clipboard.writeText(poolData.tokenMint.toBase58())
                                }}><CopyIcon sx={{fontSize:"20px", color: "rgb(118, 139, 173)"}}/></IconButton>
                            </Tooltip>
                        </div>
                    </div>
                    <p className="schedule-header">Unlock Date(s)</p>
                    {
                        (poolData.schedule as any[]).map((item,idx)=>{
                            return <div key={idx} className="info-description">
                                <div className="info-value">{getCurrentTime(new Date(Number(item.releaseTime.toNumber() * 1000)))}</div>
                                <div className="info-value">{Number(item.amount.toString())===0 ? <span style={{color: "#9999DD"}}>Unlocked</span> : Number(item.amount.toString())/(10**poolData.tokenInfo.decimals)}</div>
                            </div>
                        })
                    }
                </div>
                {
                    publicKey!=null && publicKey.toBase58()===poolData.owner.toBase58() &&
                    <>                    
                        {
                            poolData.balance===0 ?
                            (
                                isUnlocking ?
                                    <Button variant="contained" color="error" className="btn-unlock"><CircularProgress disableShrink color="inherit" /></Button>
                                :
                                    <Button variant="contained" color="error" className="btn-unlock" onClick={async()=>{
                                        setIsUnlocking(true)
                                        try{
                                            await closePool(poolData.address)
                                            openNotification('success', 'Success!')
                                        }catch(err: any){
                                            openNotification('error', err.message)
                                        }
                                        setIsUnlocking(false)
                                    }}>Close Lock</Button>
                            )
                            :
                            (
                                isUnlocking ?
                                    <Button variant="contained" color="success" className="btn-unlock"><CircularProgress disableShrink color="inherit" /></Button>
                                :
                                    <Button variant="contained" color="success" className="btn-unlock" onClick={async()=>{
                                        setIsUnlocking(true)
                                        try{
                                            await unlock(poolData.address)
                                            openNotification('success', 'Unlock Success!')
                                        }catch(err: any){
                                            openNotification('error', err.message)
                                        }
                                        setIsUnlocking(false)
                                    }}>Unlock</Button>
                            )
                        }
                        <div className="input-group">
                            <input className="normal-input" placeholder="new owner address" value={newOwner} onChange={(e)=>{setNewOwner(e.target.value)}} />
                        </div>
                        {
                            isTransferring ?
                                <Button variant="contained" color="warning" className="btn-transfer"><CircularProgress disableShrink color="inherit" /></Button>
                            :
                                <Button variant="contained" color="warning" className="btn-transfer" onClick={async()=>{
                                    setIsTransferring(true)
                                    try{
                                        let newOwnerPubkey = new PublicKey(newOwner)
                                        await transferOwnership(poolData.address, newOwnerPubkey)
                                        openNotification('success', 'Transfer Success!')
                                        setNewOwner("")
                                    }catch(err: any){
                                        openNotification('error', err.message)
                                    }
                                    setIsTransferring(false)
                                }}>Transfer Ownership</Button>
                        }
                    </>
                }
            </>
        }
    </div>
}
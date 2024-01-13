import { useEffect, useState } from "react"
import { PublicKey } from '@solana/web3.js';
import { useProgram } from "../utils/useProgram"
import { CircularProgress, Button, } from "@mui/material"
import { getCurrentTime, openNotification } from '../utils/constants'
import { DatePicker } from "antd"
import dayjs from 'dayjs'

export default function CreatePanel(){
    const { lock, isPoolExist } = useProgram()

    const [token, setToken] = useState("")
    const [vestingSeed, setVestingSeed] = useState("")
    const [vestingSchedule, setVestingSchedule] = useState<any[]>([])
    const [isExist, setIsExist] = useState(false)
    const [isButtonLoading, setIsButtonLoading] = useState(false)
    const monthTime = 24*60*60*1000

    useEffect(()=>{
        getPoolExist()
    },[vestingSeed])

    const getPoolExist = async()=> {
        setIsExist(await isPoolExist(vestingSeed))
    }
    
    return <div className="create-panel">
        <h2>Create Lock</h2>
        <div className="input-group">
            Mint address:<input className={"normal-input"} placeholder="the SPL Token address of your NFT, token or LP token" onChange={(e)=>{setToken(e.target.value)}} value={token}/> 
        </div>
        <div className="input-group">
            Lock name:<input className={"normal-input" + (isExist? " invalid" : "")} placeholder="Make This Unique - It's Public" onChange={(e)=>{setVestingSeed(e.target.value)}} value={vestingSeed}/> 
        </div>
        {
            isExist && <div style={{color: "rgb(236, 84, 84)", textAlign: "right", marginBottom: "10px"}}>Already exist</div>
        }
        <div className="schedule-wrapper">
            <div className="schedule-header">
                <p>Unlock date(s):</p>
                <Button className="btn-add" variant="contained" color="error" onClick={()=>{
                    setVestingSchedule(vestingSchedule.concat([{time: getCurrentTime(new Date(new Date().getTime() + monthTime)) }]))
                }}>Add</Button>
            </div>
            {
                vestingSchedule.map((item, idx)=>{
                    return <div key={idx} className="one-schedule">
                        <DatePicker format="YYYY-MM-DD HH:mm" bordered showTime className="date-picker" defaultValue={dayjs(item.time)} onChange={(date, dateString)=>{
                            setVestingSchedule(vestingSchedule.map((subItem,index)=>{
                                if(index===idx)
                                    return {time:dateString, amount:subItem.amount}
                                else
                                    return subItem
                            }))
                        }}/>
                        <input className="normal-input" placeholder="#amount" value={item.amount} onChange={(e)=>{
                            setVestingSchedule(vestingSchedule.map((subItem,index)=>{
                                if(index===idx)
                                    return {time:subItem.time, amount:e.target.value}
                                else
                                    return subItem
                            }))
                        }}/>
                        <Button variant="outlined" color="info" onClick={()=>{
                            setVestingSchedule(vestingSchedule.filter((subItem,index,arr)=>{
                                return index!==idx														
                            }))
                        }}>-</Button>
                    </div>
                })
            }
        </div>
        {
            isButtonLoading ?
                <Button variant="contained" color="success" className="btn-lock"><CircularProgress disableShrink color="inherit" /></Button>
            :
                <Button disabled={isButtonLoading} variant="contained" color="success" className="btn-lock" onClick={async()=>{
                    setIsButtonLoading(true)
                    try{
                        let tokenMint = new PublicKey(token)
                        await lock(tokenMint, vestingSeed, vestingSchedule)
                        openNotification('success', 'Lock Success!')
                        setVestingSeed("")
                        setVestingSchedule([])
                    }catch(err: any){
                        console.log(err)
                        openNotification('error', err.message)
                    }
                    setIsButtonLoading(false)
                }}>Lock</Button>
        }
    </div>
}
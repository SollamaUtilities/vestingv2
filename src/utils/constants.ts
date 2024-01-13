import {notification} from 'antd'
import { ConfirmOptions, PublicKey } from '@solana/web3.js'

export const InfoVesting = {
    programId: new PublicKey("1ockKL5chR89E4K576QfJP6jeW9v5cNoPjxKyZmJ7us"),
    feeData: "GF6s97KyFbGV44wBbKEhHkZHuUAzJbq2JngBgK3Akj5w",
    idl: require('./vesting.json'),
}

export const confirmOptions: ConfirmOptions = {commitment : 'finalized',preflightCommitment : 'finalized',skipPreflight : false}

export const openNotification = (type : 'success' | 'error' | 'info' | 'warning', title : string, description? : string) => {
    notification[type]({
        message : title, description : description, placement : 'topLeft'
    })
}

export const getCurrentTime = (date : Date) => {
    let month = (date.getMonth()+1) >= 10 ? (date.getMonth()+1) :"0"+(date.getMonth()+1)
    let day = date.getDate() >= 10 ? date.getDate() : "0"+date.getDate()
    let hours = date.getHours() >= 10 ? date.getHours() : "0"+date.getHours()
    let minutes = date.getMinutes() >= 10 ? date.getMinutes() : "0"+date.getMinutes()
    return date.getFullYear()+"-"+month+"-"+day+"  "+hours+":"+minutes
}
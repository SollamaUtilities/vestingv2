import { Heading, IconButton, Popover, PopoverArrow, PopoverCloseButton, PopoverContent, PopoverTrigger, Table, Thead, Tr, Th, Td, VStack, Tbody } from "@chakra-ui/react";
import { FaPhabricator } from "react-icons/fa";
import AddressComponent from "./AddressComponent";
import { getCurrentTime } from "../utils/constants";

export default function ViewDetailComponent(props : any){
    return <Popover placement="right">
        <PopoverTrigger>
            <IconButton className="btn-view" variant="link" colorScheme="blackAlpha" aria-label="View Detail" minWidth="none" icon={<FaPhabricator/>}/>
        </PopoverTrigger>
        <PopoverContent className="detail-panel-wrapper">
            <PopoverArrow bg="#202020 !important" boxShadow="-1px 1px 1px 0 #404040 !important"/>
            <PopoverCloseButton/>       
            {
                props.data!==undefined && <VStack className="detail-panel" p={2} justifyContent="left" textAlign='left'>
                    <h2>Lock Detail</h2>
                    <div className="detail-info-part">
                        <p className="detail-info-part-header">Name:</p>
                        <p className="detail-info-part-content">{props.data.seed}</p>
                    </div>
                    <hr/>
                    <div className="detail-info-part">
                        <p className="detail-info-part-header">Owner:</p>
                        <AddressComponent preHref="https://solscan.io/account/" address={props.data.owner.toBase58()} length={6}/>
                    </div>
                    <hr/>
                    <div className="detail-info-part">
                        <p className="detail-info-part-header">Asset:</p>
                        <AddressComponent preHref="https://solscan.io/token/" address={props.data.tokenMint.toBase58()} length={6}/>
                    </div>
                    <hr/>
                    <div className="detail-info-part">
                        <p className="detail-info-part-header">Created Time:</p>
                        <p className="detail-info-part-content">{getCurrentTime(new Date(Number(props.data.createdTime.toNumber() * 1000)))}</p>
                    </div>
                    <hr/>
                    <div className="detail-info-part">
                        <p className="detail-info-part-header">Amount:</p>
                        <p className="detail-info-part-content">{props.data.balance/(10**props.data.tokenInfo.decimals)} {Number(props.data.tokenInfo.supply)===0 ? "" : "(" + Math.round(props.data.balance/Number(props.data.tokenInfo.supply)*10000)/100+" %)"}</p>
                    </div>
                    <hr/>
                    <div className="detail-info-part vesting-schedule-panel">
                        <Table pb={2}>
                            <Thead>
                                <Tr><Th>Time</Th><Th>Amount</Th></Tr>
                            </Thead>
                            <Tbody>
                            {
                                (props.data.schedule as any[]).map((item,idx)=>{
                                    return <Tr key={idx}>
                                        <Td fontSize='14px'>{getCurrentTime(new Date(Number(item.releaseTime.toNumber() * 1000)))}</Td>
                                        <Td fontSize='14px'>{Number(item.amount.toString())===0 ? <span style={{color: "#9999DD"}}>Unlocked</span> : Number(item.amount.toString())/(10**props.data.tokenInfo.decimals)}</Td>
                                    </Tr>
                                })
                            }
                            </Tbody>
                        </Table>
                        <hr/>
                    </div>
                </VStack>
            }
        </PopoverContent>
    </Popover>
}
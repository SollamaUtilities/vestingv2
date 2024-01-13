import {TableContainer, Thead, Tr, Td, Tbody, Table, Progress, IconButton} from '@chakra-ui/react';
import { useEffect, useState, useCallback } from "react"
import { useProgram } from "../utils/useProgram"
import { FaUndo } from 'react-icons/fa';
import { ChakraProvider, ColorModeProvider, theme } from "@chakra-ui/react";
import ArrowComponent from '../components/ArrowComponents';
import AddressComponent from '../components/AddressComponent';
import ViewDetailComponent from '../components/ViewDetailComponent';
import { getCurrentTime } from '../utils/constants';

export default function LiveLockPage(){
    const { getAllPools } = useProgram()
    const [isLoading, setIsLoading] = useState(false)
    const [pools, setPools] = useState<any[]>([])
    const [activeSort, setActiveSort] = useState(0)
    const [direction, setDirection] = useState(1)

    useEffect(()=>{
        getPools()
    },[])

    const getPools = async() => {
        setIsLoading(true)
        setPools(await getAllPools())
        setIsLoading(false)
        setActiveSort(0)
        setDirection(1)
    }

    const sortLocks = (param: number) => {
        if(param===activeSort){
            setDirection(-direction)
            setPools([...pools].reverse())
        }else{
            setActiveSort(param)
            setDirection(1)
            setPools([...pools].sort(function(a: any, b: any){
                switch(param){
                    case 0:
                        if(a.seed.toLowerCase() < b.seed.toLowerCase()) return -1;
                        if(a.seed.toLowerCase() > b.seed.toLowerCase()) return 1;
                        return 0;
                    case 1:
                        if(a.owner.toBase58().toLowerCase() < b.owner.toBase58().toLowerCase()) return -1;
                        if(a.owner.toBase58().toLowerCase() > b.owner.toBase58().toLowerCase()) return 1;
                        return 0;
                    case 2:
                        if(a.tokenMint.toBase58().toLowerCase() < b.tokenMint.toBase58().toLowerCase()) return -1;
                        if(a.tokenMint.toBase58().toLowerCase() > b.tokenMint.toBase58().toLowerCase()) return 1;
                        return 0;
                    case 3:
                        if(Number(a.createdTime.toNumber()) < Number(b.createdTime.toNumber())) return -1;
                        if(Number(a.createdTime.toNumber()) > Number(b.createdTime.toNumber())) return 1;
                        return 0;
                }
                return 0;
            }))
        }
    }

    return  <ChakraProvider theme={theme}>
        <ColorModeProvider options={{initialColorMode: 'dark'}}>
            <div className="live-dashboard">
                <div className="main-panel">
                    <h1>Live Locks</h1>
                    {
                        isLoading ?
                            <Progress width="100%" size='xs' borderRadius="2px" colorScheme='pink' isIndeterminate></Progress>
                        :
                            <>
                                <IconButton width="20px" style={{margin:"20px 10px 10px 10px"}} variant='link' colorScheme="teal" fontSize="14px" aria-label="Reload" icon={<FaUndo/>} onClick={()=>{getPools()}}/>
                                <TableContainer style={{marginTop: "0"}} width="100px" minWidth="100%" className="lock-table-wrapper">
                                    <Table>
                                        <Thead>
                                            <Tr>
                                                <Td></Td>
                                                <Td onClick={()=>{sortLocks(0)}} cursor='pointer'>Seed {activeSort===0 && <ArrowComponent direction={direction}/>}</Td>
                                                <Td onClick={()=>{sortLocks(1)}} cursor='pointer'>Owner {activeSort===1 && <ArrowComponent direction={direction}/>}</Td>
                                                <Td onClick={()=>{sortLocks(2)}} cursor='pointer'>Locked Asset {activeSort===2 && <ArrowComponent direction={direction}/>}</Td>
                                                <Td onClick={()=>{sortLocks(3)}} cursor='pointer'>Created Time {activeSort===3 && <ArrowComponent direction={direction}/>}</Td>
                                                <Td>Locked Amount</Td>
                                                <Td>% Locked</Td>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                        {
                                            pools.map((item,idx)=>{
                                                return <Tr key={idx} fontSize="14px">
                                                    <Td>
                                                        <ViewDetailComponent data={item}/>
                                                    </Td>
                                                    <Td><AddressComponent nolink address={item.seed}/></Td>
                                                    <Td><AddressComponent preHref="https://solscan.io/account/" address={item.owner.toBase58()}/></Td>
                                                    <Td><AddressComponent preHref="https://solscan.io/token/" address={item.tokenMint.toBase58()}/></Td>
                                                    <Td>{getCurrentTime(new Date(Number(item.createdTime.toNumber()*1000)))}</Td>
                                                    <Td>{item.balance/(10**item.tokenInfo.decimals)}</Td>
                                                    <Td>{Number(item.tokenInfo.supply)===0 ? "-" : Math.round(item.balance/Number(item.tokenInfo.supply)*10000)/100+" %"}</Td>
                                                </Tr>
                                            })
                                        }
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </>
                    }
                </div>
            </div>
        </ColorModeProvider>
    </ChakraProvider>
}
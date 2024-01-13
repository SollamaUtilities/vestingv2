import {Box, AppBar, Toolbar, Typography} from '@mui/material'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import LogoIMG from '../assets/images/sollama.svg'
import { useEffect, useState } from 'react'

export default function Header(){
    const [windowSize, setWindowSize] = useState(window.innerWidth)
    useEffect(()=>{
        function handleWindowResize(){
            setWindowSize(window.innerWidth)
        }
        window.addEventListener('resize', handleWindowResize)
        return ()=>{
            window.removeEventListener('resize',handleWindowResize)
        }
    },[])

    return <Box sx={{display: 'flex'}}>
        <AppBar component="nav" sx={{background: "#121212", zIndex: 10000}}>
            <Toolbar>
                <Typography variant='h4' component="div" sx={{flexGrow: 1, display: "flex", alignItems: "center", fontWeight: "bold", lineHeight: "44px", fontFamily: "Niamey", cursor: "pointer !important", color:"#53fdca"}}>
                    <img src={LogoIMG} alt="logo" width="45px"  onClick={()=>{window.location.href="https://sollama.com"}}/>{windowSize>430 ? "SOLLAMA":""}
                </Typography>
                <Box sx={{display: "block"}}>
                    <WalletMultiButton/>
                </Box>
            </Toolbar>
        </AppBar>
    </Box>
}

import { useState } from "react";
import { Button, Modal, Checkbox, ThemeProvider, createTheme, FormControlLabel } from '@mui/material';

const darkTheme = createTheme({
    palette:{mode: 'dark'}
})

export default function Disclaimer(){
    const isShow = localStorage.getItem("isDisclaimerShow")
    const [isForever, setIsForever] = useState(false)
    const [open, setOpen] = useState(isShow==null || isShow===undefined || (isShow==="true" || isShow==="1"))
    const handleClose = () => {
        setOpen(false);
    };
    const handleDisagree = () => {
        window.location.href = "https://sollama.com"
    }
    const handleAgree = () => {
        if(isForever)
            localStorage.setItem("isDisclaimerShow", "false")
        setOpen(false);
    }

    return <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
    >
        <div className="disclaimer-panel">
            <h2 id="parent-modal-title">Disclaimer</h2>
            <p id="parent-modal-description">
                Sollama and its associated dApps provide a non-custodial online platform that grants access to numerous smart contracts present on the Solana Blockchain. It does not function as a regulated financial or payment service in any jurisdiction. Terms such as "swap", "exchange", "asset", "liquidity", and "pool" are employed for reference purposes only and do not carry any legal significance in a regulated or traditional financial setting. None of the Sollama applications' smart contracts are designed to work with security tokens in any capacity. Furthermore, Sollama applications do not permit, process, or facilitate user-to-user transfers of tokens or other assets, nor do they support third-party payments.<br/>By using any Sollama applications, you acknowledge and accept the inherent risks involved, including but not limited to cyberattacks, software failures, and fluctuations in token prices, which may lead to significant and irreversible losses. The information provided on this website and/or the dApp/user interface does not constitute an invitation, advice, or recommendation to purchase, trade, or sell digital assets.<br/>By accessing and utilizing the services offered by Sollama and its associated dApps, you agree to hold the website owners harmless and waive any rights to legal remedies against them for any losses that may arise due to your use of the platform.
            </p>
            <div className="disclaimer-footer">
                <Button className="btn-agree" color="success" variant="contained" onClick={handleAgree}>I AGREE</Button>
                <Button className="btn-agree" color="error" variant="contained" onClick={handleDisagree}>DISAGREE</Button>
            </div>
            <ThemeProvider theme={darkTheme}>
                <div className="disclaimer-check">
                    <FormControlLabel control={<Checkbox color="success" onChange={(e)=>{setIsForever(e.target.checked)}}/>} label="Don't show anymore" />
                </div>
            </ThemeProvider>
        </div>
    </Modal>
}
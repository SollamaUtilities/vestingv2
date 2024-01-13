import { HStack, IconButton, Tooltip } from "@chakra-ui/react";
import { ContentCopyRounded as CopyIcon } from "@mui/icons-material";

export default function AddressComponent(props : any){
    const getSubString = (str : String, length : number) => {
        if(str.length<=length*2) return str
        return str.substr(0,length)+"..."+str.substr(-length,length)
    }

    return <HStack alignItems="center" pt={2} pb={2}>
        <Tooltip label="Copy" placement="top" hasArrow arrowSize={5}>
            <IconButton fontSize="14px" variant="link" colorScheme="gray" aria-label="Copy Address" minWidth="none" icon={<CopyIcon sx={{fontSize: "20px"}}/>} onClick={()=>{
                navigator.clipboard.writeText(props.address)
            }}></IconButton>
        </Tooltip>
        {
            props.nolink ?
                <span style={{cursor: "pointer"}}>{getSubString(props.address, props.length===undefined ? 6 : props.length)}</span>      
            :
                <a rel="noreferrer" href={props.preHref + props.address} target="_blank" style={{color : "#5090cc"}}>{getSubString(props.address, props.length===undefined ? 6 : props.length)}</a>
        }
    </HStack>
}
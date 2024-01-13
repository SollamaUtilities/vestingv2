import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function ArrowComponent(props : any){
    return <div style={{display:"inline-block", fontSize: "10px", verticalAlign: "middle", color:"white"}}>
    {
        props.direction===1 ?
            <FaArrowDown/>
        :
            <FaArrowUp/>
    }
    </div>
}
import CreatePanel from "../components/create-panel"
import ManagePanel from "../components/manage-panel"


export default function LockPage(){
    return <div className="dashboard">
        <div className="main-panel">
            <CreatePanel/>
            <ManagePanel/>
        </div>
    </div>
}
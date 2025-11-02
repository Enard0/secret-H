import Role from "./Role";
import Back from "../assets/policy/back.png"

const Selfrole = ({ _Role="None"}) => {
    
    return (
        <div className={`selfrole ${_Role}`}>
            <img src={Back} className="Back" />
            <Role _Role={_Role}/>
        </div>
    );
}

export default Selfrole
import React from "react";
import './Player.css'


const User = ({ _Classes="", _Id, _func=null, _line=false, _Data={"avatar":"0f8f56cf265e44684be079c7d6378d00","userName":_Id} }) => {
    return (
        <div className={`user-item ${_Classes}`} onClick={_func ? ()=>{_func(_Id)} : ()=>{}}>
            <div className={`user-data ${_Classes}`}>
                <div className={_func ? "func" : ""}>
                    <img src={`https://cdn.discordapp.com/avatars/${_Id}/${_Data.avatar}?size=1024`} />
                    <p>{_Data.userName}</p>
                </div>
            </div>
            {_line && <div className="line"/>}
        </div>
    );
}

export default User
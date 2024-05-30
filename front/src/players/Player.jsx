import React from "react";
import './Player.css'

const getName = (UserId) => {return UserId}

const getUrl = (UserId) => {return "https://cdn.discordapp.com/avatars/682689661486891019/0f8f56cf265e44684be079c7d6378d00?size=1024"}

const User = ({ _Classes="", _Id, _func=null }) => {
    return (
        <div className={`user-item ${_Classes}`} onClick={_func ? ()=>{_func(_Id)} : ()=>{}}>
            <div className={`user-data ${_Classes}`}>
                <div className={_func ? "func" : ""}>
                    <img src={getUrl(_Id)} />
                    <p>{getName(_Id)}</p>
                </div>
            </div>
            <div className="line"/>
        </div>
    );
}

export default User
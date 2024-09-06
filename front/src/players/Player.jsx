import React from "react";
import './Player.css'

const Avatar = ({UserId,_Avatar}) => {
    if(_Avatar) 
    return <div className="avatar"><img src={`https://cdn.discordapp.com/avatars/${UserId}/${_Avatar}?size=1024`} /><div className="extra"/></div>
    return <div className="avatar"><img src={`https://cdn.discordapp.com/embed/avatars/${(UserId >>> 22) % 6}.png`} /><div className="extra"/></div>
}

const User = ({ _Classes="", _func=null, _line=false, _Data=null, UserId }) => {
    let username = "NULL"   
    let AvatarH = null
    //console.log(_Data)
    //console.log(UserId)
    if(_Data!=null && UserId in _Data){
        AvatarH =_Data[UserId].avatar
        username = _Data[UserId].userName
    }
    return (
        <div className={`user-item ${_Classes}`} onClick={_func ? ()=>{_func(UserId)} : ()=>{}}>
            <div className={`user-data ${_Classes}`}>
                <div className={_func ? "func" : ""}>
                    <Avatar UserId={UserId} _Avatar={AvatarH}/>
                    <p>{username}</p>
                </div>
            </div>
            {_line && <div className="line"/>}
        </div>
    );
}

export default User
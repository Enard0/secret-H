import React from "react";
import './Player.css'

const User = ({ _Classes, _Name, _Url }) => {
    return (
        <div className={`user-item ${_Classes}`}>
            <div className={`user-data ${_Classes}`}>
                <p>{_Name}</p>
                <img src={_Url} />            
            </div>
            <div className="line"/>
        </div>
    );
}

export default User
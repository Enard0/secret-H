import "./Role.css"
import React from "react";

import L from "../assets/roles/liberal/party.png"

import L1 from "../assets/roles/liberal/1.png"
import L2 from "../assets/roles/liberal/2.png"
import L3 from "../assets/roles/liberal/3.png"
import L4 from "../assets/roles/liberal/4.png"
import L5 from "../assets/roles/liberal/5.png"
import L6 from "../assets/roles/liberal/6.png"



import F from "../assets/roles/fascist/party.png"

import F1 from "../assets/roles/fascist/1.png"
import F2 from "../assets/roles/fascist/2.png"
import F3 from "../assets/roles/fascist/3.png"
import F4 from "../assets/roles/fascist/4.png"

import H from "../assets/roles/fascist/hitler.png"



import C from "../assets/roles/communist/party.png"

import C1 from "../assets/roles/communist/1.png"
import C2 from "../assets/roles/communist/2.png"
import C3 from "../assets/roles/communist/3.png"
import C4 from "../assets/roles/communist/4.png"

const Roles = {"L":[L1, L2, L3, L4, L5, L6],
                "F":[F1, F2, F3, F4,],
                "C":[C1, C2, C3, C4,],
                "H":[H]}

const Party = {"L":L,"F":L,"C":C,"H":H}

const Role = ({ _Role="None", _Id=0, _Type='R' }) => {
    
    if(_Type=="R")
    return (
        <div className={`role-card ${_Role}`}>
            <img src={_Role in Roles ? Roles[_Role][_Id % Roles[_Role].length] : L} />
        </div>
    );

    return (
        <div className={`party-card ${_Role}`}>
            <img src={_Role in Party ? Party[_Role] : L} />
        </div>
    );
}

export default Role
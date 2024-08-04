import ReactModal from "react-modal";
import React, { useEffect, useState } from "react";

import Lcard from "../assets/policy/liberal.png"
import Fcard from "../assets/policy/fascist.png"
import Ccard from "../assets/policy/communist.png"

import Lempty from "../assets/board/liberal/empty.png"
import Lwin from "../assets/board/liberal/win.png"

import Fempty from "../assets/board/fascist/empty.png"
import Fwin from "../assets/board/fascist/win.png"
import FcheckCards from "../assets/board/fascist/checkCards.png"
import FcheckRole from "../assets/board/fascist/checkRole.png"
import Fkill from "../assets/board/fascist/kill.png"
import Fveto from "../assets/board/fascist/kill+veto.png"
import Fpresident from "../assets/board/fascist/president.png"

import CaddCards from "../assets/board/communist/addCards.png"
import Cchange from "../assets/board/communist/change.png"
import Ccheck from "../assets/board/communist/check.png"
import Cempty from "../assets/board/communist/empty.png"
import Cmeet from "../assets/board/communist/meet.png"
import Creveal from "../assets/board/communist/reveal.png"
import Cwin from "../assets/board/communist/win.png"

import './Boards.css'

const Fields = {"L":{ "Lempty": Lempty, "Lwin": Lwin },
"F":{ "Fempty": Fempty, "Fwin": Fwin, "FcheckCards": FcheckCards, "FcheckRole": FcheckRole, "Fkill": Fkill, "Fveto": Fveto, "Fpresident": Fpresident },
"C":{ "Cadd": CaddCards, "Cchange": Cchange, "Ccheck": Ccheck, "Cempty": Cempty, "Cmeet": Cmeet, "Creveal": Creveal, "Cwin": Cwin }}

const Cards = {"L":Lcard, "F":Fcard, "C":Ccard,}

const Field = ({_Type, _Name, _Card=false}) => {
    return (
        <div className="Board-element">
                        <img className="Board-image" src={Fields[_Type][_Name]} />
                        {_Card? <img className="Board-card" src={Cards[_Type]} /> : ''}
                    </div>
    );
}

export default Field
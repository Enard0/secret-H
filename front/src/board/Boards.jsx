import ReactModal from "react-modal";
import React, { useEffect, useState } from "react";
import Field from "./Field";

/*
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
import Field from "./Field";

const Lfields = { "Lempty": Lempty, "Lwin": Lwin }
const Ffields = { "Fempty": Fempty, "Fwin": Fwin, "FcheckCards": FcheckCards, "FcheckRole": FcheckRole, "Fkill": Fkill, "Fveto": Fveto, "Fpresident": Fpresident }
const Cfields = { "Cadd": CaddCards, "Cchange": Cchange, "Ccheck": Ccheck, "Cempty": Cempty, "Cmeet": Cmeet, "Creveal": Creveal, "Cwin": Cwin }*/

const Boards = ({ _Boards, _L, _C, _F }) => {

    return (
        <div className="Boards">
            <BoardL _Board={_Boards["L"]} _Count={_L} />
            <BoardF _Board={_Boards["F"]} _Count={_F} />
            <BoardC _Board={_Boards["C"]} _Count={_C} />
        </div>
    );
}

const BoardF = ({ _Board, _Count }) => {
    
    return (
        <div className="Board-F">
            {(() => {
                const toRender = [];

                for (let i = 0; i < _Board.length; i++) {
                    toRender.push(<Field key={i} _Type="F" _Name={_Board[i]} _Card={_Count > i}/>)
                    /*<div key={i} className="Board-element">
                        <img className="Board-image" src={Ffields[Board[i]]} />
                        {Count > i ? <img className="Board-card" src={Fcard} /> : ''}
                </div>);*/
                }
                return toRender;
            })()}

        </div>
    )
}

const BoardL = ({ _Board, _Count }) => {

    return (
        <div className="Board-L">
            {(() => {
                const toRender = [];

                for (let i = 0; i < _Board.length; i++) {
                    toRender.push(<Field key={i} _Type="L" _Name={_Board[i]} _Card={_Count > i}/>)
                    /*toRender.push(<div key={i} className="Board-element">
                        <img className="Board-image" src={Lfields[Board[i]]} />
                        {Count > i ? <img className="Board-card" src={Lcard} /> : ''}
                    </div>);*/
                }
                return toRender;
            })()}

        </div>
    )
}

const BoardC = ({ _Board, _Count }) => {

    return (
        <div className="Board-C">
            {(() => {
                const toRender = [];

                for (let i = 0; i < _Board.length; i++) {
                    toRender.push(<Field key={i} _Type="C" _Name={_Board[i]} _Card={_Count > i}/>)
                    /*toRender.push(<div key={i} className="Board-element">
                        <img className="Board-image" src={Cfields[Board[i]]} />
                        {Count > i ? <img className="Board-card" src={Ccard} /> : ''}
                    </div>);*/
                }
                return toRender;
            })()}

        </div>
    )
}

export default Boards
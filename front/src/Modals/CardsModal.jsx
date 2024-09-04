import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import User from "../players/Player";
import './Modal.css'

import Lcard from "../assets/policy/liberal.png"
import Fcard from "../assets/policy/fascist.png"
import Ccard from "../assets/policy/communist.png"

const Cards = { "L": Lcard, "F": Fcard, "C": Ccard }

export const Card = ({ _Card, func }) => {
    return (
        <div className="card" onClick={() => func(_Card)}>
            <img src={Cards[_Card]} />
        </div>
    )
}
export const CardsModal = ({ _isOpen, _Cards = [], _Chan = 0, _Veto= false, SessionId, UserId, _PlayerData }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])

    const Reject = (c) => {
        handleCloseModal()
        fetch(`/api/rejectCard/${SessionId}/${UserId}`, {
            method: "POST",
            body: JSON.stringify({
                Rejected: c,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
    };

    const Veto = () =>{
        handleCloseModal()
        fetch(`/api/veto/${SessionId}/${UserId}`, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
    }
    if (_Cards.length == 3 && _Chan != 0) {

        return (
            <div>
                <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                    <div className="Content">
                        <div className="Action">
                            <div>Discard</div>
                            <div>P: <User UserId={_Chan} _Data={_PlayerData}/></div>
                        </div>
                        <div className="Cards">
                            <Card _Card={_Cards[0]} func={Reject}/>
                            <Card _Card={_Cards[1]} func={Reject}/>
                            <Card _Card={_Cards[2]} func={Reject}/>
                        </div>
                    </div>
                </ReactModal>
            </div>
        );
    }
    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    <div className="Action">
                        <div>Discard</div>
                        <div>Board</div>
                    </div>
                    <div className="Cards">
                        <Card _Card={_Cards[0]} func={Reject}/>
                        <Card _Card={_Cards[1]} func={Reject}/>
                    </div>
                    {_Veto===true && <button onClick={Veto}>VETO</button>}
                    {_Veto==="disabled" && <button onClick={Veto} disabled={true}>VETO</button>}
                </div>
            </ReactModal>
        </div>
    );
}
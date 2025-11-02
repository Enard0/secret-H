import React, { useEffect, useState, useRef } from "react";
import ReactModal from "react-modal";
import User from "../players/Player";
import './Modal.css'

import Lcard from "../assets/policy/liberal.png"
import Fcard from "../assets/policy/fascist.png"
import Ccard from "../assets/policy/communist.png"
import DraggableCard from "../Draggable/DraggableCard";

const Cards = { "L": Lcard, "F": Fcard, "C": Ccard }

export const Card = ({ _Card, func }) => {
    return (
        <div className="card" onClick={() => func(_Card)}>
            <img src={Cards[_Card]} />
        </div>
    )
}
export const CardsModal = ({ _isOpen, _Cards = [], _Chan = 0, _Veto = false, SessionId, UserId, _PlayerData }) => {
    const [isOpen, setIsOpen] = useState(false)
    const handleCloseModal = () => setIsOpen(false)

    const Rejected = useRef("F")
    const CardsActed = useRef(0)
    const Accepted = useRef(0)
    
    const Discard = React.createRef(null)
    const Accept = React.createRef(null)

    useEffect(() => {
        if (_isOpen) {
            CardsActed.current = 0;
            Rejected.current = "E";
            Accepted.current = 0;
            setFields([[Discard, rf], [Accept, af]])
            setIsOpen(_isOpen);
        }
    }, [_isOpen])


    /*const setposReject = (rect) => {
        RejectPos.current = ([rect.left, rect.right, rect.top, rect.bottom])
    }

    const setposAccept = (rect) => {
        AcceptPos.current = ([rect.left, rect.right, rect.top, rect.bottom])
    }

    const handleRelease = (x, y, c) => {
        console.log(x, y, AcceptPos.current, RejectPos.current)
        if (AcceptPos.current[0] < x && x < AcceptPos.current[1] && AcceptPos.current[2] < y && y < AcceptPos.current[3]) {
            console.log(c)
            CardsLeft.current--;
        } else if (RejectPos.current[0] < x && x < RejectPos.current[1] && RejectPos.current[2] < y && y < RejectPos.current[3]) {
            console.log(c)
            Rejected.current = c
            CardsLeft.current--;
        } else {
            return false
        }
        if (!CardsLeft.current || (CardsLeft.current ==1 && _Cards.length ==2))
            Reject(Rejected.current)
        return true
    }*/

    const Reject = () => {
        handleCloseModal()
        fetch(`/api/rejectCard/${SessionId}/${UserId}`, {
            method: "POST",
            body: JSON.stringify({
                Rejected: Rejected.current,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
    };

    const Veto = () => {
        handleCloseModal()
        fetch(`/api/veto/${SessionId}/${UserId}`, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
    }

    const af = (c) => { ++Accepted.current>1 && setFields([[Discard, rf]]);
        ++CardsActed.current>=Cards.length && Reject();
     }
    const rf = (c) => { Rejected.current = c; 
        setFields([[Accept, af]]);
        ++CardsActed.current>=Cards.length && Reject();
    }

    const [Fields, setFields] = useState([[Discard, rf], [Accept, af]])
    
    if (_Cards.length == 3 && _Chan != 0) {

        return (
            <div>
                <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                    <div className="Content">
                        <div className="Action">
                            <div className="dropfield" ref={Discard}>
                                Discard
                            </div>
                            <div className="dropfield" ref={Accept}>
                                P: <User UserId={_Chan} _Data={_PlayerData} />
                            </div>
                        </div>
                        <div className="Cards">
                            <DraggableCard _Card={_Cards[0]} dropFields={Fields} />
                            <DraggableCard _Card={_Cards[1]} dropFields={Fields} />
                            <DraggableCard _Card={_Cards[2]} dropFields={Fields} />
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
                        <div className="dropfield" ref={Discard}>
                            Discard</div>
                        <div className="dropfield" ref={Accept}>
                            Board
                        </div>
                    </div>
                    <div className="Cards">
                        <DraggableCard _Card={_Cards[0]} dropFields={Fields} />
                        <DraggableCard _Card={_Cards[1]} dropFields={Fields} />
                    </div>
                    {_Veto === true && <button onClick={Veto}>VETO</button>}
                    {_Veto === "disabled" && <button onClick={Veto} disabled={true}>VETO</button>}
                </div>
            </ReactModal >
        </div >
    );
}
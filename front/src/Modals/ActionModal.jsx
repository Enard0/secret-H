import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import Role from "../roles/Role.jsx"
import './Modal.css'
import { Card } from "./CardsModal.jsx";
import User from "../players/Player.jsx";


export const WinModal = ({ _isOpen, _Type }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])


    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    {(() => {
                        switch (_Type) {
                            case "L":
                                return <div className="winners"><Role _Role="L" _Type="P" /></div>
                            case "F":
                                return <div className="winners"><Role _Role="F" _Type="P" /></div>
                            case "C":
                                return <div className="winners"><Role _Role="C" _Type="P" /></div>
                            case "!F":
                                return <div className="winners"><Role _Role="L" _Type="P" /><Role _Role="C" _Type="P" /></div>
                        }
                    })()}
                </div>
                <button className="close" onClick={handleCloseModal}>
                    <span className="material-symbols-outlined" >
                        close
                    </span>
                </button>
            </ReactModal>
        </div>
    );
}


export const CheckCardsModal = ({ _isOpen, SessionId, UserId }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [nextCards, setNextCards] = useState(['l', 'l', 'l'])

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) {
            fetch(`/api/cards/${SessionId}/${UserId}`).then(response => {
                if (response.status == 200) {
                    response.json().then(json => {
                        setNextCards(json)
                        setIsOpen(_isOpen)
                    })
                }
            })
        }
    }, [_isOpen])


    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    Next cards:
                    <div className="Cards">
                        <Card _Card={nextCards[0]} func={null} />
                        <Card _Card={nextCards[1]} func={null} />
                        <Card _Card={nextCards[2]} func={null} />
                    </div>
                </div>
                <button className="close" onClick={handleCloseModal}>
                    <span className="material-symbols-outlined" >
                        close
                    </span>
                </button>
            </ReactModal>
        </div>
    );
}


export const CheckRoleModal = ({ _isOpen, _President, _Choosen, _Role=null, }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])

    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    <div className="Checked">
                        <User _Id={_Choosen}/>
                        {_Role != null && <Role _Role={_Role} _Type="P" />}
                    </div>
                    <div className="President">
                        <User _Id={_President}/>
                    </div>
                </div>
                <button className="close" onClick={handleCloseModal}>
                    <span className="material-symbols-outlined" >
                        close
                    </span>
                </button>
            </ReactModal>
        </div>
    );
}

export const VetoModal = ({ _isOpen, _Chancellor, SessionId, UserId }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])

    const Vote = (v) => {
        fetch(`/api/vetoReact/${SessionId}/${UserId}`, {
            method: "POST",
            body: JSON.stringify({
                Vote: v,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
    };

    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    <div className="Candiate"><div>Chancellor: <User _Id={_Chancellor} /></div></div>
                    <div className="VotingButtons">
                        <div className="Y" onClick={() => { handleCloseModal(); Vote(1) }}>
                            <span className="material-symbols-outlined">
                                check_box
                            </span>
                        </div>
                        <div className="N" onClick={() => { handleCloseModal(); Vote(0) }}>
                            <span className="material-symbols-outlined">
                                disabled_by_default
                            </span>
                        </div>
                    </div>
                </div>
            </ReactModal>
        </div>
    );
}
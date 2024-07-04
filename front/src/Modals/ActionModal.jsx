import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import Role from "../roles/Role.jsx"
import './Modal.css'



export const WinModal = ({ _isOpen, _Type}) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])


    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    {(()=>{switch(_Type){
                        case "L":
                            return <div className="winners"><Role _Role="L" _Type="P"/></div>
                        case "F":
                            return <div className="winners"><Role _Role="F" _Type="P"/></div>
                        case "C":
                            return <div className="winners"><Role _Role="C" _Type="P"/></div>
                        case "!F":
                            return <div className="winners"><Role _Role="L" _Type="P"/><Role _Role="C" _Type="P"/></div>
                    }})()}
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
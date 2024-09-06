import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import Role from "../roles/Role";
import User from "../players/Player";
import './Modal.css'

ReactModal.setAppElement('#root');

export const RoleModal = ({ _isOpen, _UserRole, _Roles, _Meet = false, UserId, _PlayerData }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)


    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])


    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    <div className="role-self"><div>Twoja rola: <Role _Role={_UserRole} _Id={0} /></div></div>
                    {((_UserRole == "C" && _Meet) || _UserRole == "F") && _UserRole in _Roles ? (() => {
                        var torender = []
                        var tid = 1
                        for (const i of _Roles[_UserRole]) {
                            if (i != UserId) {
                                torender.push(<div _Id={tid}><Role _Role={_UserRole} /><User _Data={_PlayerData} UserId={i}/></div>)
                                tid++
                            }
                        }
                        if (_UserRole == "F") {
                            torender.push(<div _Id={tid}>H:{<User _Classes="H" _Data={_PlayerData} UserId={_Roles.H}/>} <Role _Role={"H"} _Id={0} /></div>)
                        }
                        return <div className="role-other">{torender}</div>
                    })() : ""}
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

export const VotingModal = ({ _isOpen, _Candidate = 0, SessionId, UserId, _PlayerData }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])

    const Vote = (v) => {
        fetch(`/api/vote/${SessionId}/${UserId}`, {
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
                    <div className="Candiate"><div>Candidate: <User UserId={_Candidate} _Data={_PlayerData}/></div></div>
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

export const PostVotingModal = ({ _isOpen, _For, _Against, _Abstain, UserId, _PlayerData }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])


    return (
        <div>
            <ReactModal isOpen={isOpen} onRequestClose={handleCloseModal} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    <div className="postVote-for"><div>Za: </div>
                    {(() => {
                        var torender = []
                        for (const i of _For) {
                            torender.push(<div><User UserId={i} _Data={_PlayerData}/></div>)
                        }
                        return torender
                    })()}
                    </div>
                    <div className="postVote-against"><div>Przeciw: </div>
                    {(() => {
                        var torender = []
                        for (const i of _Against) {
                            torender.push(<div><User UserId={i} _Data={_PlayerData}/></div>)
                        }
                        return torender
                    })()}
                    </div>
                    <div className="postVote-abstain"><div>Wstrzymano: </div>
                    {(() => {
                        var torender = []
                        for (const i of _Abstain) {
                            torender.push(<div><User UserId={i} _Data={_PlayerData}/></div>)
                        }
                        return torender
                    })()}
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
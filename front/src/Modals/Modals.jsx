import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import Role from "../roles/Role";
import User from "../players/Player";
import './Modal.css'

ReactModal.setAppElement('#root');

export const RoleModal = ({ _isOpen, _UserRole, _Roles, UserId }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [UserRole, setUserRole] = useState('L')
    const [Roles, setRoles] = useState(_Roles)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        setUserRole(_UserRole)
    }, [_UserRole])

    useEffect(() => {
        setRoles(_Roles)
    }, [_Roles])

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])


    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                <div className="Content">
                    <div className="role-self"><div>Twoja rola: <Role _Role={UserRole} _Id={0} /></div></div>
                    {(UserRole == "C" || UserRole == "F") && UserRole in Roles ? (() => {
                        var torender = []
                        var tid = 1
                        for (const i of Roles[UserRole]) {
                            if (i != UserId) {
                                torender.push(<div><Role _Role={UserRole} _Id={tid} /><p>Us: {i}</p></div>)
                                tid++
                            }
                        }
                        if (UserRole == "F") {
                            torender.push(<div>H:{Roles.H} <Role _Role={"H"} _Id={0} /></div>)
                        }
                        console.log(torender)
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

export const VotingModal = ({ _isOpen, _Candidate=0, SessionId, UserId}) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen])

    const Vote = (v) => {
        fetch(`/api/vote/${SessionId}/${UserId}`, {
          method: "POST",
          body: JSON.stringify({
            Vote:v,
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
                    <div className="Candiate"><div>Kandydat: <User _Id={_Candidate} /></div></div>
                    <div className="VotingButtons">
                        <div className="Y" onClick={() => {handleCloseModal(); Vote(1)}}>
                            <span className="material-symbols-outlined">
                                check_box
                            </span>
                        </div>
                        <div className="N" onClick={() => {handleCloseModal(); Vote(0)}}>
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
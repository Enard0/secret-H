import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import './Modal.css'
ReactModal.setAppElement('#root');

const RoleModal = ({ _isOpen, _role }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [Role, setRole] = useState('L')

    const handleCloseModal = () => setIsOpen(false)

    useEffect(() => {
        setRole(_role)
        if (_isOpen) setIsOpen(_isOpen)
    }, [_isOpen, _role])


    return (
        <div>
            <ReactModal isOpen={isOpen} className="Modal" overlayClassName="Overlay">
                Twoja rola: {Role}
                <button onClick={handleCloseModal}>Close Modal</button>
            </ReactModal>
        </div>
    );
}

export default RoleModal
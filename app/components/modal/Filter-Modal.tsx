'use client'
import React, { useState } from 'react'
import Button from '../button/Button'
import ModalComponent from './ModalComponent'

export default function Userinfo() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSignUpClick = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <Button onClick={handleSignUpClick}>Sign Up</Button>
            {isModalOpen && <ModalComponent isOpen={isModalOpen} onRequestClose={closeModal} />}
        </div>
    )
}

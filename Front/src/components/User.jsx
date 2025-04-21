import React, { useState } from "react";
import styled from "styled-components";
import ModalPassword from "./ModalPassword";

const ModalContainer = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    z-index: 1000;
    width: 300px;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const CloseButton = styled.button`
    background: red;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    margin: 10px auto 0;
    margin-right: 5px;
`;

const AlterPassword = styled.button`
    background: var(--DwBoldGray);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    margin: 10px auto 0;
    margin-right: 5px;
`;

const User = ({ user, onClose }) => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const togglePasswordModal = () => {
        setIsPasswordModalOpen(!isPasswordModalOpen);
    };

    return (
        <>
            <Overlay onClick={onClose} />
            <ModalContainer>
                <h2>Dados do Usuário</h2>
                <p><strong>Nome:</strong> {user?.nome}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Nascimento:</strong> {user?.nasc ? user.nasc.slice(0, 10).split('-').reverse().join('/') : ''}</p>
                <p><strong>CPF:</strong> {user?.cpf}</p>
                <p><strong>Endereço:</strong> {user?.endereco}</p>
                <p><strong>Turma:</strong> {user?.turma}</p>
                <p><strong>Cargo:</strong> {user?.role}</p>
                <CloseButton onClick={onClose}>Fechar</CloseButton>
                <AlterPassword onClick={togglePasswordModal}>Alterar Senha</AlterPassword>
            </ModalContainer>

            {/* Modal de Alteração de Senha */}
            {isPasswordModalOpen && <ModalPassword onClose={togglePasswordModal} userId={user?.id} />}
        </>
    );
};

export default User;

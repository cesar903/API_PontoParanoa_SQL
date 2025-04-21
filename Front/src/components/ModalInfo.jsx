import React, { useState, useEffect } from "react";
import styled from "styled-components";


const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const CloseButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #d32f2f;
  }
`;

const SaveButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #388e3c;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-top: 1rem;
  font-size: 1rem;
  min-height: 100px;
`;

const ModalInfo = ({ message, onClose, onSave, isProfessor }) => {
  const [newMessage, setNewMessage] = useState(message);

  useEffect(() => {
    setNewMessage(message);
  }, [message]);

  const handleChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSave = () => {
    if (onSave) {
      console.log("Saving message:", newMessage);
      onSave(newMessage); 
    }
    onClose();
  };

  if (!message) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <p>{isProfessor ? "Editar aviso" : "Aviso"}</p>
        {isProfessor ? (
          <>
            <TextArea
              value={newMessage}
              onChange={handleChange}
              placeholder="Digite o novo aviso"
            />
            <SaveButton onClick={handleSave}>Salvar</SaveButton>
          </>
        ) : (
          <p>{message}</p>
        )}
        <CloseButton onClick={onClose}>Fechar</CloseButton>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ModalInfo;

import React from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid var(--DwLightGray);
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: var(--DwLightGray);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  margin-right: 10px;
  transition: background 0.3s;

  &:hover {
    background-color: var(--DwMediumGray);
  }
`;

const Modal = ({ isOpen, onClose, onConfirm, observacao, setObservacao }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <TextArea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Adicione uma observação..."
        />
        <Button onClick={onConfirm}>OK</Button>
        <Button onClick={onClose}>Cancelar</Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
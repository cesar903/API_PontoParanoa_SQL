import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import Loading from "./Loading";

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
`;

const ModalContent = styled.div`
  background: var(--DwMediumGray);
  padding: 25px;
  border-radius: 12px;
  width: 420px;
  color: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
`;

const Button = styled.button`
  padding: 12px;
  border: none;
  cursor: pointer;
  margin: 10px 5px 0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: 0.3s;

  ${({ variant }) =>
    variant === "edit"
      ? `
        background: var(--DwYellow);
        color: var(--DwBoldGray);
        &:hover {
          background: #e5a500;
        }
      `
      : `
        background: var(--DwBoldGray);
        color: white;
        &:hover {
          background: var(--DwBoldGray);
        }
      `}
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin-top: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 2px solid var(--DwLightGray);
  border-radius: 6px;
  background: var(--DwBoldGray);
  color: white;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: var(--DwYellow);
  }
`;

function PointEdit({ isOpen, onClose, ponto, atualizarLista }) {
  const [entrada, setEntrada] = useState(ponto?.entrada || "");
  const [saida, setSaida] = useState(ponto?.saida || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/professores/ponto/editar/${ponto.id}`,
        { entrada, saida },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Horários atualizados com sucesso!");
      atualizarLista();
      onClose();
    } catch (error) {
      alert("Erro ao atualizar ponto.");
    } finally {
      setLoading(false); 
  }
  };

  useEffect(() => {
    setEntrada(ponto?.entrada || "");
    setSaida(ponto?.saida || "");
  }, [ponto]);

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <Loading show={loading} />
      <ModalContent>
        <h2>Editar Ponto</h2>
        <Label>Entrada:</Label>
        <Input
          type="datetime-local"
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
        />
        <Label>Saída:</Label>
        <Input
          type="datetime-local"
          value={saida}
          onChange={(e) => setSaida(e.target.value)}
        />
        <div>
          <Button variant="edit" onClick={handleSave}>
            Salvar
          </Button>
          <Button variant="cancel" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}

export default PointEdit;

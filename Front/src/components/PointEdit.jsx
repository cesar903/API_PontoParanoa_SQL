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
  const [dtEntrada, setDtEntrada] = useState(ponto?.dt_entrada || "");
  const [dtSaida, setDtSaida] = useState(ponto?.dt_saida || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);

      const pad = (n) => (n < 10 ? "0" + n : n);

      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hour = pad(date.getHours());
      const minute = pad(date.getMinutes());

      return `${year}-${month}-${day}T${hour}:${minute}`;
    };


    setDtEntrada(formatDate(ponto?.dt_entrada));
    setDtSaida(formatDate(ponto?.dt_saida));
  }, [ponto]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `https://escolinha.paranoa.com.br/api/professores/ponto/editar/${ponto.pk_ponto}`,
        {
          dt_entrada: dtEntrada ? dtEntrada.replace("T", " ") : null,
          dt_saida: dtSaida ? dtSaida.replace("T", " ") : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Horários atualizados com sucesso!");
      atualizarLista();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar ponto.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <Loading show={loading} />
      <ModalContent>
        <h2>Editar Ponto</h2>

        <Label>Entrada:</Label>
        <Input
          type="datetime-local"
          value={dtEntrada}
          onChange={(e) => setDtEntrada(e.target.value)}
        />

        <Label>Saída:</Label>
        <Input
          type="datetime-local"
          value={dtSaida}
          onChange={(e) => setDtSaida(e.target.value)}
        />

        <div>
          <Button variant="edit" onClick={handleSave}>Salvar</Button>
          <Button variant="cancel" onClick={onClose}>Cancelar</Button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}

export default PointEdit;


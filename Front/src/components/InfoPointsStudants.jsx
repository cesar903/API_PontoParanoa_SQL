import React, { useState, useEffect } from "react";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import PointEdit from "./PointEdit";
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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--DwBoldGray);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  background-color: var(--DwBoldGray);
  padding: 10px;
  color: white;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 700;
  color: var(--DwBoldGray);
  margin-right: 5px;
  margin-top: 10px;
`;

const SeletorMes = styled(DatePicker)`
  padding: 8px;
  font-size: 14px;
  border: 1px solid var(--DwLightGray);
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  width: 120px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: var(--DwMediumGray);
  }
`;

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-right: 10px;

  background-color: darkred;

  &:hover {
    opacity: 0.8;
  }
`;

const ButtonEdit = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-right: 10px;

  background-color: var(--DwYellow);

  &:hover {
    opacity: 0.8;
  }
`;

const InfoPointsStudants = ({ aluno, onClose }) => {
  const [mesSelecionado, setMesSelecionado] = useState(new Date());
  const [pontos, setPontos] = useState([]);
  const [pontosFiltrados, setPontosFiltrados] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pontoSelecionado, setPontoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const fetchPontos = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Você não está autenticado.");
      return;
    }

    try {
      const response = await axios.get(`https://escolinha.paranoa.com.br/api/alunos/${aluno.id}/pontos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPontos(response.data);
    } catch (error) {
      alert(error.response?.data?.msg || "Erro ao buscar os pontos.");
    } 
  };

  useEffect(() => {
    if (!aluno) return;
    fetchPontos();
  }, [aluno]);

  useEffect(() => {
    const filtroPontos = pontos.filter((ponto) => {
      const dataEntrada = new Date(ponto.entrada);
      return (
        dataEntrada.getMonth() === mesSelecionado.getMonth() &&
        dataEntrada.getFullYear() === mesSelecionado.getFullYear()
      );
    });
    setPontosFiltrados(filtroPontos);
  }, [pontos, mesSelecionado]);

  const openEditModal = (ponto) => {
    const entrada = new Date(ponto.entrada);
    const saida = new Date(ponto.saida);

    // Corrigir para fuso horário local
    setPontoSelecionado({
      ...ponto,
      entrada: entrada.toLocaleString("sv-SE").slice(0, 16), // Formato YYYY-MM-DDTHH:mm
      saida: saida.toLocaleString("sv-SE").slice(0, 16), // Formato YYYY-MM-DDTHH:mm
    });
    setIsEditModalOpen(true);
  };

  const handleModalOverlayClick = (e) => {
    // Apenas fecha o modal se o clique for fora da ModalContent
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExcluirPonto = async (pontoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você não está autenticado.");
      return;
    }

    const confirmar = window.confirm("Você tem certeza que deseja excluir este ponto?");
    if (!confirmar) return; // Se o usuário cancelar, não faz nada

    try {
      await axios.delete(`https://escolinha.paranoa.com.br/api/professores/ponto/${pontoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPontos(); 
      alert("Ponto excluído com sucesso.");
    } catch (error) {
      alert(error.response?.data?.msg || "Erro ao excluir ponto.");
    }
  };

  const atualizarLista = async () => {
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você não está autenticado.");
      return;
    }

    try {
      const response = await axios.get(`https://escolinha.paranoa.com.br/api/alunos/${aluno.id}/pontos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPontos(response.data);
    } catch (error) {
      alert(error.response?.data?.msg || "Erro ao buscar os pontos.");
    }
  };


  if (!aluno) return null;

  return (
    <ModalOverlay onClick={handleModalOverlayClick}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Check-ins de {aluno.nome}</h2>
        <Label>Selecionar Mês:</Label>
        <SeletorMes
          selected={mesSelecionado}
          onChange={(date) => setMesSelecionado(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
        />

        <CloseButton onClick={onClose}>X</CloseButton>

        <Table>
          <thead>
            <tr>
              <Th>Data</Th>
              <Th>Status</Th>
              <Th>Entrada/Saida</Th>
              <Th>Editar</Th>
            </tr>
          </thead>
          <tbody>
            {pontosFiltrados.length > 0 ? (
              pontosFiltrados.map((check, index) => (
                <tr key={index}>
                  <Td>{new Date(check.entrada).toLocaleDateString()}</Td>
                  <Td>{check.status}</Td>
                  <Td>
                    {check.entrada ? new Date(check.entrada).toLocaleTimeString() : "—"} /{" "}
                    {check.saida ? new Date(check.saida).toLocaleTimeString() : "—"}
                  </Td>
                  <Td>
                    <ButtonEdit onClick={() => openEditModal(check)}>Editar</ButtonEdit>
                    <Button onClick={() => handleExcluirPonto(check.id)}>Excluir</Button>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="4">Nenhum check-in encontrado</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </ModalContent>
      {isEditModalOpen && (
        <PointEdit
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          ponto={pontoSelecionado}
          onSave={() => fetchPontos()}
          atualizarLista={atualizarLista}
        />
      )}
    </ModalOverlay>
  );
};

export default InfoPointsStudants;

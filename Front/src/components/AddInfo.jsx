import { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaCalendarPlus } from "react-icons/fa";
import Loading from './Loading';

const AddManualButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: black;
  color: var(--DwYellow);
  border: none;
  padding: 15px 20px;
  border-radius: 100px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--DwYellow);
    color: black;
  }
`;

const ModalBackground = styled.div`
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

const ModalContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1100;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ModalButton = styled.button`
  background-color: var(--DwLightGray);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: var(--DwYellow);
    color: #000000;
    font-weight: 800;
  }
`;

function AddInfo() {
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        dia: "",
        aviso: "",
    });
    const [loading, setLoading] = useState(false);

    const handleAddManualPonto = () => {
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado. Faça login novamente.");
            return;
        }
        setLoading(true);
        try {
            const dataFormatada = formData.dia;

            await axios.patch(
                `http://localhost:5000/api/professores/calendario/${encodeURIComponent(dataFormatada)}/aviso`,
                { aviso: formData.aviso },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Aviso adicionado com sucesso!");
            setModalOpen(false);
        } catch (error) {
            console.error("Erro ao adicionar aviso:", error);
            alert("Erro ao adicionar aviso.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <AddManualButton onClick={handleAddManualPonto}>
                <FaCalendarPlus />
            </AddManualButton>
            <Loading show={loading} />

            {modalOpen && (
                <ModalBackground>
                    <ModalContainer>
                        <h3>Adicionar Aviso</h3>
                        <Input
                            type="date"
                            name="dia"
                            value={formData.dia}
                            onChange={handleChange}
                            placeholder="Dia"
                        />
                        <Input
                            type="text"
                            name="aviso"
                            value={formData.aviso}
                            onChange={handleChange}
                            placeholder="Digite o aviso"
                        />
                        <ModalButton onClick={handleSubmit}>Adicionar</ModalButton>
                        <ModalButton onClick={() => setModalOpen(false)}>Cancelar</ModalButton>
                    </ModalContainer>
                </ModalBackground>
            )}
        </>
    );
}

export default AddInfo;

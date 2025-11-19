import { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaPenAlt } from "react-icons/fa";
import Loading from "./Loading";

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
`;

const ModalContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Select = styled.select`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ModalButton = styled.button`
  background-color:var(--DwLightGray);
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

function ManualPointTeacher() {
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        alunoId: "",
        dia: "",
        chegada: "",
        saida: "",
    });
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAlunos = async () => {
            setLoading(true);
            try {
                const response = await axios.get("https://escolinha.paranoa.com.br/api/professores/alunos", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setAlunos(response.data);
            } catch (error) {
                console.error("Erro ao carregar alunos", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlunos();
    }, []);

    const handleAddManualPonto = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado. Faça login novamente.");
            return;
        }

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

        const { alunoId, dia, chegada, saida } = formData;
        setLoading(true);
        try {
            await axios.post(
                "https://escolinha.paranoa.com.br/api/professores/ponto/manual",
                { alunoId, dia, chegada, saida },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Ponto manual adicionado com sucesso!");
            setModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.msg || "Erro ao adicionar o ponto manual.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AddManualButton onClick={handleAddManualPonto}>
                <FaPenAlt />
            </AddManualButton>

            {modalOpen && (
                <ModalBackground>
                    <Loading show={loading} />
                    <ModalContainer>
                        <h3>Adicionar Ponto Manual</h3>
                        <Select
                            name="alunoId"
                            value={formData.alunoId}
                            
                            onChange={handleChange}
                        >
                            <option value="">Selecione o aluno</option>
                            {alunos.map((aluno) => (
                                <option key={aluno.id} value={aluno.id}>
                                    {aluno.nome}
                                </option>
                            ))}
                        </Select>

                        <Input
                            type="date"
                            name="dia"
                            value={formData.dia}
                            onChange={handleChange}
                            placeholder="Dia"
                        />
                        <Input
                            type="time"
                            name="chegada"
                            value={formData.chegada}
                            onChange={handleChange}
                            placeholder="Horário de Chegada"
                        />
                        <Input
                            type="time"
                            name="saida"
                            value={formData.saida}
                            onChange={handleChange}
                            placeholder="Horário de Saída"
                        />
                        <ModalButton onClick={handleSubmit}>Adicionar</ModalButton>
                        <ModalButton onClick={() => setModalOpen(false)}>Cancelar</ModalButton>
                    </ModalContainer>
                </ModalBackground>
            )}
        </>
    );
}

export default ManualPointTeacher;

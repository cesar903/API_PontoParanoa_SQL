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
    font-weight: 800
  }
`;

const Select = styled.select` 
    padding: 10px 15px;
    font-size: 1rem;
    border-radius: 2px;
    border: none;
    outline: none;
    background: var(--DwYellow);
    color: #333;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s ease-in-out;
`

function ManualPoint() {
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        dia: "",
        chegada: "",
        saida: "",
    });
    const [loading, setLoading] = useState(false);
    const [turmas, setTurmas] = useState([]);
    const [turmaEscolhida, setTurmaEscolhida] = useState(null);

    const handleAddManualPonto = async () => {
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

        if (!turmaEscolhida?.id) {
            alert("Selecione uma turma!");
            return;
        }

        const { dia, chegada, saida } = formData;
        setLoading(true);

        try {
            await axios.post(
                "https://escolinha.paranoa.com.br/api/alunos/ponto/manual",
                {
                    dia,
                    chegada,
                    saida,
                    id_turma: turmaEscolhida.id
                },
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


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const fetchTurmas = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("https://escolinha.paranoa.com.br/api/usuario", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const turmasRecebidas = response.data;
                setTurmas(turmasRecebidas);
            } catch (error) {
                console.error("Erro ao buscar turmas:", error);
            }
        };

        fetchTurmas();
    }, []);

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
                            value={turmaEscolhida?.id || ""}
                            onChange={(e) => {
                                const turmaId = e.target.value;
                                const turma = turmas.find(t => String(t.id) === String(turmaId));

                                setTurmaEscolhida(turma);
                            }}
                        >
                            <option value="">Selecione uma turma...</option>
                            {turmas.map((turma) => (
                                <option key={turma.id} value={turma.id}>
                                    {turma.nome}
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

export default ManualPoint;

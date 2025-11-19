import { useEffect, useState } from "react";
import Graph from "./Graph";
import ManualPointTeacher from "./ManualPointTeacher";
import PointEdit from "./PointEdit";
import Loading from "./Loading";
import SelectClass from "./SelectClass";
import axios from "axios";
import styled from "styled-components";
import { FaCheck, FaExclamationTriangle, FaClock } from "react-icons/fa";

import { jwtDecode } from "jwt-decode";


const Table = styled.table`
  margin-top: 40px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  font-weight: 700;
  border-radius: 10px;
  overflow: hidden;

  th, td {
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: var(--DwBoldGray);
    color: white;
  }
`;

const StatusCell = styled.td`
  background-color: ${(props) => {
        if (props.$status === "aprovado") return "#82f89e";
        if (props.$status === "rejeitado") return "#f17b85";
        return "#f6f0f0";
    }}; 
  font-weight: bold;
  text-align: center;
`;

const TableRow = styled.tr`
  background-color: ${(props) => {
        if (props.$status === "aprovado") return "#82f89e";
        if (props.$status === "rejeitado") return "#f17b85";
        return "#f6f0f0";
    }}; 
`;

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-right: 10px;

  background-color: ${(props) => (props.$approve ? "var(--DwYellow)" : "var(--DwMediumGray)")};

  &:hover {
    opacity: 0.8;
  }
`;

const Titulo = styled.p`
    font-size: 2rem;
    color: var(--DwBoldGray);
    font-weight: 800;
    margin-top: 20px;
    background-color: #f3efef;
    padding-left: 100px;
    border-left: var(--DwYellow) 20px solid;
    border-radius: 10px 10px 10px 10px;
`;

const ActionCell = styled.td`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px;
`;


function StudantList() {
    const [alunosPendentes, setAlunosPendentes] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [pontoSelecionado, setPontoSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [turmas, setTurmas] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState("");
    const [role, setRole] = useState(null);


    useEffect(() => {
        if (!turmaSelecionada) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        fetchPendentes();
    }, [turmaSelecionada]);

    const fetchPendentes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `https://escolinha.paranoa.com.br/api/professores/pontos/pendentes?turmaId=${turmaSelecionada}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setAlunosPendentes(response.data);
        } catch (error) {
            setError("Erro ao carregar alunos pendentes");
        } finally {
            setLoading(false);
        }
    };



    const formatarData = (data) => {
        if (!data) return "—";
        return new Date(data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    };

    useEffect(() => {

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            setRole(decodedToken.role);
        } catch (error) {
            console.error("Erro ao decodificar token:", error);
        }

        const fetchTurmas = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("https://escolinha.paranoa.com.br/api/usuario", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const turmasRecebidas = response.data;
                setTurmas(turmasRecebidas);

                if (turmasRecebidas.length > 0) {
                    setTurmaSelecionada(turmasRecebidas[0].id.toString());
                }
            } catch (error) {
                console.error("Erro ao buscar turmas:", error);
            }
        };

        fetchTurmas();
    }, []);



    const atualizarStatusPonto = async (id, status, saida) => {
        if (status === "aprovado" && !saida) {
            alert("O aluno ainda não registrou a hora de saída.");
            return;
        }

        const confirmacao = window.confirm(`Tem certeza que deseja ${status === "aprovado" ? "aprovar" : "rejeitar"} este ponto?`);

        if (!confirmacao) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `https://escolinha.paranoa.com.br/api/professores/ponto/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPendentes()
        } catch (error) {
            alert("Erro ao atualizar status do ponto.");
        } finally {
            setLoading(false);
        }
    };

    if (error) return <p>{error}</p>;

    const closeModal = () => setIsModalOpen(false);

    const openEditModal = (ponto) => {
        const entrada = new Date(ponto.entrada);
        const saida = new Date(ponto.saida);

        setPontoSelecionado({
            ...ponto,
            entrada: entrada.toLocaleString("sv-SE").slice(0, 16),
            saida: saida.toLocaleString("sv-SE").slice(0, 16),
        });
        setIsEditModalOpen(true);
    };

    const handleFinalizar = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado. Faça login novamente.");
            return;
        }

        const confirmacao = window.confirm("Deseja finalizar o ponto deste aluno?");
        if (!confirmacao) return;

        setLoading(true);
        try {
            await axios.put(
                `https://escolinha.paranoa.com.br/api/professores/ponto/finalizar-ponto/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPendentes()
        } catch (error) {
            console.error("Erro ao finalizar o ponto:", error);
            alert("Não foi possível finalizar o ponto.");
        } finally {
            setLoading(false);
        }

    };

    return (
        <>
            <SelectClass
                value={turmaSelecionada}
                onChange={(e) => setTurmaSelecionada(e.target.value)}
                options={turmas}
                placeholder="Selecione uma turma"
            />
            <div className="container">


                <Loading show={loading} />
                {alunosPendentes.length === 0 ? (
                    <Titulo>Nenhum aluno com aprovação pendente.  <div>
                    </div><FaCheck /></Titulo>

                ) : (
                    <Table>

                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Entrada</th>
                                <th>Saída</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alunosPendentes.map((ponto) => (
                                <TableRow key={ponto.pk_ponto} $status={ponto.tp_status}>
                                    <StatusCell $status={ponto.tp_status}>
                                        {ponto.tp_status === "aprovado" && <FaCheck />}
                                        {ponto.tp_status === "rejeitado" && <FaExclamationTriangle />}
                                        {ponto.tp_status === "pendente" && <FaClock />}
                                    </StatusCell>
                                    <td>{ponto.aluno?.nm_usuario}</td>
                                    <td>{ponto.aluno?.ds_email}</td>
                                    <td>{formatarData(ponto.dt_entrada)}</td>
                                    <td>{formatarData(ponto.dt_saida)}</td>
                                    <ActionCell>
                                        <Button
                                            $approve
                                            onClick={() => atualizarStatusPonto(ponto.pk_ponto, "aprovado", ponto.dt_saida)}
                                        >
                                            Aprovar
                                        </Button>
                                        <Button onClick={() => atualizarStatusPonto(ponto.pk_ponto, "rejeitado")}>
                                            Reprovar
                                        </Button>

                                        <Button onClick={() => openEditModal(ponto)}>Editar</Button>
                                        {!ponto.dt_saida && (
                                            <Button $approve onClick={() => handleFinalizar(ponto.pk_ponto)}>
                                                Finalizar
                                            </Button>
                                        )}
                                    </ActionCell>
                                </TableRow>
                            ))}

                        </tbody>
                    </Table>
                )}

                {/* <Graph /> */}

                <ManualPointTeacher closeModal={closeModal} />

                {isEditModalOpen && (
                    <PointEdit
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        ponto={pontoSelecionado}
                        atualizarLista={() => window.location.reload()}
                    />
                )}

            </div>
        </>
    );
}

export default StudantList;

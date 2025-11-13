import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { FaCheck, FaExclamationTriangle, FaClock } from "react-icons/fa";
import ManualPointTeacher from "./ManualPointTeacher";
import PointEdit from "./PointEdit";
import Loading from "./Loading";
import { jwtDecode } from "jwt-decode";
import Graph from "./Graph";

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
    const [professorTipo, setProfessorTipo] = useState(null);


    useEffect(() => {
        const fetchPendentes = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "https://escolinha.paranoa.com.br/api/professores/pontos/pendentes",
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

        fetchPendentes();
    }, []);

    const formatarData = (data) => {
        if (!data) return "—";
        return new Date(data).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    };

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

            setAlunosPendentes(alunosPendentes.filter((ponto) => ponto.id !== id));
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

        // Corrigir para fuso horário local
        setPontoSelecionado({
            ...ponto,
            entrada: entrada.toLocaleString("sv-SE").slice(0, 16), // Formato YYYY-MM-DDTHH:mm
            saida: saida.toLocaleString("sv-SE").slice(0, 16), // Formato YYYY-MM-DDTHH:mm
        });
        setIsEditModalOpen(true);
    };

    const handleFinalizar = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado. Faça login novamente.");
            return;
        }

        if (!navigator.geolocation) {
            alert("Geolocalização não é suportada pelo seu navegador.");
            return;
        }


        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                const confirmacao = window.confirm("Deseja finalizar o ponto deste aluno?");
                if (!confirmacao) return;

                setLoading(true);
                try {
                    await axios.put(
                        `https://escolinha.paranoa.com.br/api/professores/ponto/finalizar-ponto/${id}`,
                        { latitude, longitude }, // Envia a localização do professor
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    // Atualiza a lista localmente sem precisar recarregar
                    setAlunosPendentes((prevAlunosPendentes) =>
                        prevAlunosPendentes.map((ponto) =>
                            ponto.id === id ? { ...ponto, saida: new Date().toISOString() } : ponto
                        )
                    );
                } catch (error) {
                    console.error("Erro ao finalizar o ponto:", error);
                    alert("Não foi possível finalizar o ponto.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                alert("Erro ao acessar a localização. Ative o GPS e tente novamente.");
                console.error(error);
            }
        );
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            if (decoded && decoded.professorTipo) {
                setProfessorTipo(decoded.professorTipo);
                console.log("Professor tipo:", decoded.professorTipo);
            } else {
                console.warn("Campo 'professorTipo' não encontrado no token");
            }
        } catch (error) {
            console.error("Erro ao decodificar token:", error);
        }
    }, []);


    const alunosFiltrados = alunosPendentes.filter((ponto) => {
        const aluno = ponto.aluno;
        if (!aluno) return false;

        switch (professorTipo) {
            case "tecnologia":
                return aluno.turma === "manha" || aluno.turma === "tarde";

            case "karate":
                return aluno.turma === "karate" || aluno.karate === true;

            case "ginastica":
                return aluno.ginastica === true;

            default:
                return true; // caso não tenha tipo definido, mostra todos
        }
    });




    return (
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
                            <TableRow key={ponto.id} $status={ponto.status}>
                                <StatusCell $status={ponto.status}>
                                    {ponto.status === "aprovado" && <FaCheck />}
                                    {ponto.status === "rejeitado" && <FaExclamationTriangle />}
                                    {ponto.status === "pendente" && <FaClock />}
                                </StatusCell>
                                <td>{ponto.aluno?.nome}</td>
                                <td>{ponto.aluno?.email}</td>
                                <td>{formatarData(ponto.entrada)}</td>
                                <td>{formatarData(ponto.saida)}</td>
                                <ActionCell>
                                    <Button
                                        $approve
                                        onClick={() => atualizarStatusPonto(ponto.id, "aprovado", ponto.saida)}
                                    >
                                        Aprovar
                                    </Button>
                                    <Button onClick={() => atualizarStatusPonto(ponto.id, "rejeitado")}>
                                        Reprovar
                                    </Button>

                                    <Button onClick={() => openEditModal(ponto)}>
                                        Editar
                                    </Button>
                                    {!ponto.saida && (
                                        <Button $approve onClick={() => handleFinalizar(ponto.id)}>
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
    );
}

export default StudantList;

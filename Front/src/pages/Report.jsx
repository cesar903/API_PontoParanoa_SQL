import { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PDFReport from "../components/PDFReport";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WholeClass from "../components/WholeClass";
import Modal from "../components/ModalObs";
import Loading from "../components/Loading";

const Table = styled.table`
  margin-top: 20px;
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

const SeletorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;


const Label = styled.label`
  font-size: 16px;
  font-weight: 700;
  color: var(--DwBoldGray);
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

const SeletorTurma = styled.select`
  padding: 8px;
  font-size: 14px;
  border: 1px solid var(--DwLightGray);
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  text-align: center;
  width: 150px;
  
  &:focus {
    outline: none;
    border-color: var(--DwMediumGray);
  }
`;

const InputPesquisa = styled.input`
  padding: 8px;
  font-size: 14px;
  border: 1px solid var(--DwLightGray);
  border-radius: 5px;
  margin-top: 10px;
  width: 100%;
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #ffcc00;
  color: black;
  border: none;
  padding: 15px 20px;
  border-radius: 50px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  transition: 0.3s;

  &:hover {
    background: #ffaa00;
  }
`;




function Report() {
    const [alunos, setAlunos] = useState([]);
    const [error, setError] = useState(null);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [mesSelecionado, setMesSelecionado] = useState(new Date());
    const [relatorioPronto, setRelatorioPronto] = useState(null);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [turmaSelecionada, setTurmaSelecionada] = useState("todas");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [observacao, setObservacao] = useState("");
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [faltas, setFaltas] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchAlunos = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Você não está autenticado.");
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:5000/professores/alunos", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const alunosFiltrados = response.data.filter((aluno) => aluno.role === "aluno");
                setAlunos(alunosFiltrados);
            } catch (error) {
                setError("Erro ao carregar alunos");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlunos();
    }, []);

    const alunosFiltrados = alunos
        .filter((aluno) =>
            aluno.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) &&
            (turmaSelecionada === "todas" || aluno.turma === turmaSelecionada)
        )
        .sort((a, b) => a.nome.localeCompare(b.nome));


    const handleGerarRelatorio = async (aluno) => {
        setAlunoSelecionado(aluno);
        setRegistros([]);
        setFaltas([]);
        setLoading(true);
        try {
            const mes = mesSelecionado.getMonth() + 1;
            const ano = mesSelecionado.getFullYear();

            const responseRegistros = await axios.get(
                `http://localhost:5000/professores/relatorio/${aluno.id}?mes=${mes}&ano=${ano}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

           
            if (responseRegistros.data.length === 0) {
                alert(`O aluno ${aluno.nome} não possui registros de check-in no mês ${mes}/${ano}.`);
                return; 
            }

            const responseFaltas = await axios.get(
                `http://localhost:5000/professores/contar-faltas/${aluno.id}?mes=${mes}&ano=${ano}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            
            setRegistros(responseRegistros.data);
            setFaltas(responseFaltas.data.faltas); 
            setIsReportModalOpen(true); 
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            alert("Erro ao buscar dados do aluno.");
        }finally {
            setLoading(false); 
        }
    };

    const handleConfirmarRelatorio = () => {
        setIsReportModalOpen(false); 
        setRelatorioPronto(
            <PDFReport
                aluno={alunoSelecionado}
                registros={registros}
                mes={mesSelecionado.getMonth() + 1}
                ano={mesSelecionado.getFullYear()}
                observacao={observacao} 
                faltas={faltas}
            />
        );
        setObservacao("");
    };

    useEffect(() => {
        if (alunoSelecionado) {
            setRegistros([]);
            handleGerarRelatorio(alunoSelecionado);
        }
    }, [mesSelecionado]);

    useEffect(() => {
        if (alunoSelecionado && registros.length > 0) {
            setRelatorioPronto(
                <PDFReport
                    aluno={alunoSelecionado}
                    registros={registros}
                    mes={mesSelecionado.getMonth() + 1}
                    ano={mesSelecionado.getFullYear()}
                    observacao={observacao} 
                    faltas={faltas}
                />
            );
        } else {
            setRelatorioPronto(null);
        }
    }, [alunoSelecionado, registros, mesSelecionado]);

    if (error) return <p>{error}</p>;

    return (
        <div className="container">
            <Loading show={loading} />
            <SeletorContainer>
                <Label>Selecionar Mês:</Label>
                <FloatingButton onClick={() => setIsModalOpen(true)}>
                    Editar Turmas
                </FloatingButton>

                <WholeClass isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

                <SeletorMes
                    selected={mesSelecionado}
                    onChange={(date) => setMesSelecionado(date)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                />

                <SeletorTurma
                    value={turmaSelecionada}
                    onChange={(e) => setTurmaSelecionada(e.target.value)}
                >
                    <option value="todas">Todas</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                </SeletorTurma>
            </SeletorContainer>

            <InputPesquisa
                type="text"
                placeholder="Pesquisar aluno..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
            />

            <Table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {alunosFiltrados.map((aluno) => (
                        <tr key={aluno.id}>
                            <td>{aluno.nome}</td>
                            <td>{aluno.email}</td>
                            <td>
                                <Button onClick={() => handleGerarRelatorio(aluno)}>Gerar Relatório</Button>
                                {alunoSelecionado && alunoSelecionado.id === aluno.id && registros.length > 0 && relatorioPronto && (
                                    <PDFDownloadLink
                                        document={relatorioPronto}
                                        fileName={`relatorio_${alunoSelecionado.nome}.pdf`}
                                    >
                                        {({ loading }) => <Button>{loading ? "Gerando..." : "Baixar PDF"}</Button>}
                                    </PDFDownloadLink>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onConfirm={handleConfirmarRelatorio}
                observacao={observacao}
                setObservacao={setObservacao}
            />
        </div>
    );
}

export default Report;
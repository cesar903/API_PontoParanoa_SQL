import { useState, useEffect } from "react";
import WholeClass from "../components/WholeClass";
import Modal from "../components/ModalObs";
import Lack from "../components/Lack";
import Loading from "../components/Loading";
import SelectClass from "../components/SelectClass";
import axios from "axios";
import styled from "styled-components";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import PDFReport from "../components/PDFReport";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


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

const ButtonGroup = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column; // para empilhar os botões
  gap: 10px; // espaçamento entre eles
  z-index: 1000;
`;

const FloatingButton = styled.button`
  bottom: 20px;
  right: 20px;
  background: var(--DwYellow);
  color: black;
  border: none;
  padding: 15px 20px;
  border-radius: 50px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  transition: 0.3s;

  &:hover {
    background: var(--DwBoldGray);
    color: white;
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
    const [isLackModalOpen, setIsLackModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [faltasJustificadas, setFaltasJustificadas] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [role, setRole] = useState(null);


    const fetchAlunos = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://escolinha.paranoa.com.br/api/professores/alunos", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setAlunos(
                response.data.map(a => ({
                    id: a.pk_usuario,
                    nome: a.nm_usuario,
                    email: a.ds_email,
                    cpf: a.nr_cpf,
                    nascimento: a.dt_nascimento,
                    turmas: a.turmas ?? []
                }))
            );

        } catch (error) {
            console.error("Erro ao carregar alunos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlunos();
    }, []);



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

    const alunosFiltrados = alunos
        .filter(a =>
            a.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) &&
            (
                turmaSelecionada === "todas" ||
                a.turmas.some(t => String(t.pk_turma) === turmaSelecionada)

            )
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
                `https://escolinha.paranoa.com.br/api/professores/relatorio/${aluno.id}?mes=${mes}&ano=${ano}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            const { relatorio, faltasJustificadasArray } = responseRegistros.data;



            if (responseRegistros.data.length === 0) {
                alert(`O aluno ${aluno.nome} não possui registros de check-in no mês ${mes}/${ano}.`);
                return;
            }

            const responseFaltas = await axios.get(
                `https://escolinha.paranoa.com.br/api/professores/contar-faltas/${aluno.id}?mes=${mes}&ano=${ano}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setRegistros(relatorio)
            setFaltas(responseFaltas.data.faltas);
            setFaltasJustificadas(faltasJustificadasArray);
            setIsReportModalOpen(true);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            alert("Erro ao buscar dados do aluno.");
        } finally {
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
                faltasJustificadas={faltasJustificadas}
            />
        );
    };

    const handleEnviarRelatorio = async () => {
        if (!alunoSelecionado) {
            alert("Selecione um aluno para enviar o relatório.");
            return;
        }

        try {
            setLoading(true);

            // Dados que você já tem
            const nome = alunoSelecionado.nome;
            const mes = mesSelecionado.getMonth() + 1;
            const ano = mesSelecionado.getFullYear();


            // Criação do PDF como componente
            const doc = (
                <PDFReport
                    aluno={alunoSelecionado}
                    registros={registros}
                    mes={mes}
                    ano={ano}
                    observacao={observacao}
                    faltas={faltas}
                    faltasJustificadas={faltasJustificadas}
                />
            );


            // Geração do blob PDF
            const blob = await pdf(doc).toBlob();

            // Monta FormData
            const formData = new FormData();
            formData.append("relatorio", blob, `relatorio_${nome}_${mes}_${ano}.pdf`);
            formData.append("alunoId", alunoSelecionado._id);
            formData.append("alunoNome", nome);
            formData.append("mes", mes);
            formData.append("ano", ano);

            // Envia para o backend
            await axios.post(
                `https://escolinha.paranoa.com.br/api/professores/enviar-relatorio/${alunoSelecionado.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Relatório enviado com sucesso!");
            setObservacao("");
        } catch (error) {
            console.error("Erro ao enviar relatório:", error);
            alert("Falha ao enviar relatório.");
        } finally {
            setLoading(false);
        }
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
                    faltasJustificadas={faltasJustificadas}
                />
            );
        } else {
            setRelatorioPronto(null);
        }
    }, [alunoSelecionado, registros, mesSelecionado]);

    if (error) return <p>{error}</p>;

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
                <SeletorContainer>
                    <ButtonGroup>
                        <FloatingButton onClick={() => setIsModalOpen(true)}>
                            Editar Turmas
                        </FloatingButton>
                        <FloatingButton onClick={() => setIsLackModalOpen(true)}>
                            Falta Justificada
                        </FloatingButton>
                    </ButtonGroup>

                    <WholeClass
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        turma={turmas.find(t => String(t.id) === String(turmaSelecionada))}
                        onUpdateAlunos={fetchAlunos}
                    />
                    <Lack isOpen={isLackModalOpen} onClose={() => setIsLackModalOpen(false)} />


                    <Label>Selecionar Mês:</Label>
                    <SeletorMes
                        selected={mesSelecionado}
                        onChange={(date) => setMesSelecionado(date)}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                    />

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
                                        <>
                                            <PDFDownloadLink
                                                document={relatorioPronto}
                                                fileName={`relatorio_${alunoSelecionado.nome}.pdf`}
                                            >
                                                {({ loading }) => <Button>{loading ? "Gerando..." : "Baixar PDF"}</Button>}
                                            </PDFDownloadLink>
                                            <Button onClick={handleEnviarRelatorio}>Enviar Relatório</Button>

                                        </>
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
        </>
    );
}

export default Report;
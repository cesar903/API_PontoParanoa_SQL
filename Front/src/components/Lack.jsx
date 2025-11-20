import React, { useState, useEffect } from "react";
import loading from "./Loading";
import axios from "axios";
import styled from "styled-components";
import { FaTrash } from "react-icons/fa";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 10px rgba(0,0,0,0.25);
`;

const Title = styled.h2`
  margin-top: 0;
  font-size: 22px;
  color: #333;
`;

const Button = styled.button`
  background-color: var(--DwLightGray);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 20px;

  &:hover {
    background-color: var(--DwMediumGray);
  }
`;

const Select = styled.select`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%;
`;

const Textarea = styled.textarea`
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 10px;
    width: 100%;
`

const ButtonRegistra = styled.button`
  background-color: var(--DwYellow);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 20px;
  margin-left: 10px;
  &:hover {
    background-color: var(--DwMediumGray);
    color: #ffffff;
  }
`
const SelectTurma = styled.select` 
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
    margin-bottom: 6px;
`

export default function Lack({ isOpen, onClose }) {
    const [alunos, setAlunos] = useState([]);
    const [motivo, setMotivo] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ alunoId: "", dia: "", });
    const [modo, setModo] = useState("adicionar");
    const [faltasJustificadas, setFaltasJustificadas] = useState([]);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const [mesSelecionado, setMesSelecionado] = useState(new Date());
    const [turmas, setTurmas] = useState([]);
    const [turmaEscolhida, setTurmaEscolhida] = useState(null);
    const [alunosFiltrados, setAlunosFiltrados] = useState([]);



    const fetchAlunos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "https://escolinha.paranoa.com.br/api/professores/alunos",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = Object.values(response.data);

            const alunosFormatados = data.map(a => ({
                id: a.pk_usuario,
                nome: a.nm_usuario,
                turmas: a.turmas?.map(t => ({
                    id: t.pk_turma,
                    nome: t.nm_turma
                })) ?? []
            }));


            setAlunos(alunosFormatados);

        } catch (error) {
            console.error("Erro ao carregar alunos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { alunoId, dia } = formData;


        if (!alunoId || !dia) {
            setMensagem("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            const response = await axios.post(
                `https://escolinha.paranoa.com.br/api/professores/falta-justificada/${formData.alunoId}`,
                {
                    data: dia,
                    motivo: motivo,
                    idTurma: turmaEscolhida.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setFormData({ alunoId: "", dia: "" });
            setMotivo("");
            setMensagem("Falta registrada com sucesso!");
            setTipoMensagem("sucesso");
        } catch (error) {
            console.error(error);
            setMensagem("Verifique se o dia possui aula.");
            setTipoMensagem("erro");
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setMensagem("")
    };

    const handlePegarFaltas = async (aluno) => {
        if (!aluno) return;           
        if (!turmaEscolhida?.id) return;    

        setAlunoSelecionado(aluno);
        setMensagem("");
        setLoading(true);

        try {
            const mes = mesSelecionado.getMonth() + 1;
            const ano = mesSelecionado.getFullYear();

            const response = await axios.get(
                `https://escolinha.paranoa.com.br/api/professores/falta-justificada/${aluno.id}`,
                {
                    params: {
                        mes,
                        ano,
                        turmaId: turmaEscolhida.id,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            setFaltasJustificadas(response.data.faltas);
        } catch (error) {
            console.error("Erro ao buscar faltas:", error);
            alert("Erro ao buscar dados do aluno.");
        } finally {
            setLoading(false);
        }
    };



    const handleDeletarFalta = async (faltaId) => {
        setMensagem("");
        if (!window.confirm("Tem certeza que deseja deletar esta falta justificada?")) return;

        try {
            const response = await axios.delete(
                `https://escolinha.paranoa.com.br/api/professores/falta/${faltaId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setMensagem("Falta justificada deletada com sucesso.");
            setTipoMensagem("sucesso");

            // Atualiza a lista de faltas
            if (alunoSelecionado) {

                await handlePegarFaltas(alunoSelecionado);
            }
        } catch (error) {
            console.error("Erro ao deletar falta justificada:", error);
            setMensagem("Erro ao deletar falta justificada.");
            setTipoMensagem("erro");
        }
    };

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


    useEffect(() => {
        if (modo === "editar" && formData.alunoId) {
            setMensagem("");
            const aluno = alunos.find((a) => a.id === Number(formData.alunoId));
            if (aluno) handlePegarFaltas(aluno);
        }
    }, [modo, formData.alunoId]);

    useEffect(() => {
        setMensagem("");
        if (modo === "editar" && alunoSelecionado && turmaEscolhida?.id) {
            handlePegarFaltas(alunoSelecionado);
        }
    }, [mesSelecionado]);


    useEffect(() => {
        if (!isOpen) {
            setFormData({ alunoId: "", dia: "" });
            setMotivo("");
            setMensagem("");
            setTipoMensagem("");
            setAlunoSelecionado(null);
            setFaltasJustificadas([]);
            setModo("adicionar");
        }
    }, [isOpen]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetchAlunos();
        fetchTurmas();
    }, []);

    useEffect(() => {
        setMensagem("");

        if (modo === "editar" && alunoSelecionado && turmaEscolhida?.id) {
            handlePegarFaltas(alunoSelecionado);
        }
    }, [turmaEscolhida]);



    return (
        <ModalOverlay $isOpen={isOpen}>
            <ModalContainer>
                <div className="container">
                    <Title>Falta Justificada</Title>


                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                        <Button onClick={() => setModo("adicionar")}>Adicionar</Button>
                        <Button onClick={() => setModo("editar")}>Editar</Button>
                    </div>


                    <SelectTurma
                        value={turmaEscolhida?.id || ""}
                        onChange={(e) => {
                            const turmaId = e.target.value;

                            const turma = turmas.find(t =>
                                String(t.id) === String(turmaId)
                            );

                            setTurmaEscolhida(turma);

                            const filtrados = alunos.filter(a =>
                                a.turmas?.some(t => String(t.id) === String(turmaId))
                            );

                            setAlunosFiltrados(filtrados);
                        }}
                    >
                        <option value="">Selecione uma turma...</option>

                        {turmas.map((turma) => (
                            <option key={turma.id} value={turma.id}>
                                {turma.nome}
                            </option>
                        ))}
                    </SelectTurma>

                    <Select
                        name="alunoId"
                        value={formData.alunoId}
                        onChange={handleChange}
                    >
                        <option value="">Selecione o aluno</option>

                        {alunosFiltrados.map((aluno) => (
                            <option key={aluno.id} value={aluno.id}>
                                {aluno.nome}
                            </option>
                        ))}
                    </Select>

                    {modo === "adicionar" ? (
                        <form onSubmit={handleSubmit}>
                            <Input
                                type="date"
                                name="dia"
                                value={formData.dia}
                                onChange={handleChange}
                                placeholder="Dia"
                            />

                            <Textarea
                                placeholder=""
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                rows="3"
                            />

                            <Button onClick={onClose}>Fechar</Button>
                            <ButtonRegistra type="submit">Registrar Falta</ButtonRegistra>
                        </form>
                    ) : (
                        <div>
                            {modo === "editar" && (
                                <div>
                                    <label>Selecione o mês</label>
                                    <Input
                                        type="month"
                                        value={`${mesSelecionado.getFullYear()}-${String(
                                            mesSelecionado.getMonth() + 1
                                        ).padStart(2, "0")}`}
                                        onChange={(e) => {
                                            const [ano, mes] = e.target.value.split("-");
                                            setMesSelecionado(new Date(ano, mes - 1));
                                        }}
                                    />

                                    {faltasJustificadas.length > 0 ? (
                                        <>
                                            <h3>Faltas Justificadas</h3>
                                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ borderBottom: "1px solid #ccc" }}>Data</th>
                                                            <th style={{ borderBottom: "1px solid #ccc" }}>Motivo</th>
                                                            <th style={{ borderBottom: "1px solid #ccc" }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {faltasJustificadas.map((falta) => (
                                                            <tr key={falta.pk_falta}>
                                                                <td>{new Date(falta.calendario.dt_aula).toLocaleDateString("pt-BR")}</td>
                                                                <td>{falta.ds_motivo || "Sem motivo"}</td>
                                                                <td>
                                                                    <ButtonRegistra onClick={() => handleDeletarFalta(falta.pk_falta)}>
                                                                        <FaTrash />
                                                                    </ButtonRegistra>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <p style={{ marginTop: "10px", fontStyle: "italic" }}>
                                            Nenhuma falta justificada neste mês.
                                        </p>
                                    )}
                                    <Button onClick={onClose}>Fechar</Button>
                                </div>
                            )}
                        </div>
                    )}


                    {mensagem && (
                        <p style={{ color: tipoMensagem === "sucesso" ? "green" : "red" }}>
                            {mensagem}
                        </p>
                    )}

                </div>

            </ModalContainer>
        </ModalOverlay>
    );
}

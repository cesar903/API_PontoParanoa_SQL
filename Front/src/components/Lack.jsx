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



    useEffect(() => {
        const fetchAlunos = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:5000/api/professores/alunos", {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { alunoId, dia } = formData;
        

        if (!alunoId || !dia) {
            setMensagem("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:5000/api/professores/falta-justificada/${formData.alunoId}`,
                {
                    data: dia,
                    justificada: true, // Aqui está fixo como justificada; ajuste conforme desejar
                    motivo: motivo,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setMensagem(response.data.msg);
            setFormData({ alunoId: "", dia: "" });
            setMotivo("");
            setMensagem("Falta registrada com sucesso!");
            setTipoMensagem("sucesso");
        } catch (error) {
            console.error(error);
            setMensagem("Erro ao registrar falta.");
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
        setAlunoSelecionado(aluno);
        setMensagem("");
        setLoading(true);
        console.log("chamou")
        try {
            const mes = mesSelecionado.getMonth() + 1;
            const ano = mesSelecionado.getFullYear();

            const responseRegistros = await axios.get(
                `http://localhost:5000/api/professores/relatorio/${aluno.id}?mes=${mes}&ano=${ano}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            const { relatorio, faltasJustificadasArray } = responseRegistros.data;


            if (responseRegistros.data.length === 0) {
                alert(`O aluno ${aluno.nome} não possui registros de check-in no mês ${mes}/${ano}.`);
                return;
            }

            setFaltasJustificadas(faltasJustificadasArray);
            console.log("Faltas justificadas:", faltasJustificadasArray);

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
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
                `http://localhost:5000/api/professores/falta/${faltaId}`,
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


    useEffect(() => {
        if (modo === "editar" && formData.alunoId) {
            setMensagem("");
            const aluno = alunos.find((a) => a.id === Number(formData.alunoId));
            if (aluno) handlePegarFaltas(aluno);
        }
    }, [modo, formData.alunoId]);

    useEffect(() => {
        setMensagem("");
        if (modo === "editar" && alunoSelecionado) {

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

    return (
        <ModalOverlay $isOpen={isOpen}>
            <ModalContainer>
                <div className="container">
                    <Title>Falta Justificada</Title>


                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                        <Button onClick={() => setModo("adicionar")}>Adicionar</Button>
                        <Button onClick={() => setModo("editar")}>Editar</Button>
                    </div>

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
                                                        {faltasJustificadas.map((falta, index) => (
                                                            <tr key={index}>
                                                                <td>{falta.data}</td>
                                                                <td>{falta.motivo}</td>
                                                                <td>
                                                                    <ButtonRegistra onClick={() => handleDeletarFalta(falta.id)}>
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

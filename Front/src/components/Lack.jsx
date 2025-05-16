import React, { useState, useEffect } from "react";
import loading from "./Loading";
import axios from "axios";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
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


    useEffect(() => {
        const fetchAlunos = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:5000/professores/alunos", {
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
        alert(formData.alunoId)

        if (!alunoId || !dia) {
            setMensagem("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:5000/professores/falta-justificada/${formData.alunoId}`,
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
    };



    return (
        <ModalOverlay isOpen={isOpen}>
            <ModalContainer>
                <div className="container">
                    <Title>Falta Justificada</Title>
                    <form onSubmit={handleSubmit}>

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

                        <Textarea
                            placeholder=""
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows="3"
                        />
                        <Button onClick={onClose}>Fechar</Button>
                        <ButtonRegistra type="submit">Registrar Falta</ButtonRegistra>
                    </form>

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

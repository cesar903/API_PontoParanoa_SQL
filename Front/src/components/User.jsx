import React, { useState, useEffect } from "react";
import ModalPassword from "./ModalPassword";
import axios from "axios";
import styled from "styled-components";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ModalContainer = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ffffff;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    z-index: 1000;
    width: 90%;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.724);
    z-index: 999;
`;

const CloseButton = styled.button`
    background: var(--DwYellow);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    margin: 10px auto 0;
    margin-right: 5px;
    border-radius: 10px;
`;

const AlterPassword = styled.button`
    background: var(--DwBoldGray);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    margin: 10px auto 0;
    margin-right: 5px;
    border-radius: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  margin-top: 5px;
  width: 100%;
`;

const IconWrapper = styled.span`
  margin-right: 8px;
  vertical-align: middle;
  color: ${props => props.isLinked ? 'green' : 'red'};
`;


const User = ({ user, onClose }) => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [turmas, setTurmas] = useState([]);
    const [selectedUser, setSelectedUser] = useState(user || {
        id: "",
        nome: "",
        email: "",
        cpf: "",
        nasc: "",
        role: "",
        professorTipo: "",
        descricaoProfessor: "",
        endereco: {
            ds_logradouro: "",
            ds_numero: "",
            ds_complemento: "",
            nm_bairro: "",
            nm_cidade: "",
            sg_estado: "",
            nr_cep: ""
        },
        turmasSelecionadas: []
    });



    const togglePasswordModal = () => {
        console.log(selectedUser.endereco.ds_logradouro)
        setIsPasswordModalOpen(!isPasswordModalOpen);
    };


    const fetchUser = async (userId) => {
        if (!userId) return;
        console.log(userId)

        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                // Use 'userId' em vez de 'user'
                `https://escolinha.paranoa.com.br/api/me/usuarios/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;
            const userProps = data;

            const turmasAssociadas = data.turmasMinistradas.length > 0
                ? data.turmasMinistradas
                : data.turmas || [];


            const extractedData = {
                id: userProps.pk_usuario,
                nome: userProps.nm_usuario,
                email: userProps.ds_email,
                cpf: userProps.nr_cpf,
                nasc: userProps.dt_nascimento?.split("T")[0] || "",
                role: userProps.tp_usuario,

                professorTipo: userProps.tipoProfessor?.nm_professor_tipo || "",
                descricaoProfessor: userProps.tipoProfessor?.ds_descricao || "",

                endereco: data.endereco || {
                    ds_logradouro: "",
                    ds_numero: "",
                    ds_complemento: "",
                    nm_bairro: "",
                    nm_cidade: "",
                    sg_estado: "",
                    nr_cep: ""
                },

                turmasSelecionadas: turmasAssociadas.map(t => t.pk_turma),
                turmasCompletas: turmasAssociadas
            };

            if (userProps.tp_usuario === "professor") {
                fetchTurmas();
            }

            console.log("Dados Extraídos e Consolidados:", extractedData)

            setSelectedUser(extractedData);

        } catch (error) {
            console.error("Erro ao buscar dados completos do usuário", error);
        }
    };

    const fetchTurmas = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "https://escolinha.paranoa.com.br/api/professores/turmas",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTurmas(response.data);

        } catch (error) {
            console.error("Erro ao buscar turmas", error);
        }
    };

    useEffect(() => {
        if (user?.pk_usuario) {
            fetchUser(user.pk_usuario);
        }

    }, [user?.pk_usuario]);


    return (
        <Overlay>

            <ModalContainer>
                <h2>Informações de {selectedUser.nome}</h2>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <Input
                            type="text"
                            placeholder="Nome Completo"
                            value={selectedUser.nome}
                            onChange={(e) => setSelectedUser({ ...selectedUser, nome: e.target.value })}
                            disabled
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <Input
                            type="email"
                            placeholder="E-mail"
                            value={selectedUser.email}
                            onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            disabled
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <Input
                            type="text"
                            placeholder="CPF"
                            value={selectedUser.cpf}
                            disabled
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <Input
                            type="date"
                            value={selectedUser.nasc}
                            onChange={(e) => setSelectedUser({ ...selectedUser, nasc: e.target.value })}
                            disabled
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <Input
                            type="text"
                            placeholder="Logradouro"
                            value={selectedUser.endereco?.ds_logradouro || ""}
                            disabled
                        />
                    </div>

                    <div className="col-md-2 mb-3">
                        <Input
                            type="number"
                            placeholder="Número"
                            value={selectedUser.endereco?.ds_numero || ""}
                            disabled
                        />
                    </div>

                    <div className="col-md-4 mb-3">
                        <Input
                            type="text"
                            placeholder="Complemento"
                            value={selectedUser.endereco?.ds_complemento || ""}
                            disabled
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <Input
                            type="text"
                            placeholder="Bairro"
                            value={selectedUser.endereco?.nm_bairro || ""}
                            disabled
                        />
                    </div>

                    <div className="col-md-4 mb-3">
                        <Input
                            type="text"
                            placeholder="Cidade"
                            value={selectedUser.endereco?.nm_cidade || ""}
                            disabled
                        />
                    </div>

                    <div className="col-md-4 mb-3">
                        <Input
                            type="text"
                            maxLength={2}
                            placeholder="UF"
                            value={selectedUser.endereco?.sg_estado || ""}
                            disabled
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <Input
                            type="text"
                            placeholder="CEP"
                            value={selectedUser.endereco?.nr_cep || ""}
                            disabled
                        />
                    </div>
                    {selectedUser.role === "professor" && (
                        <>
                            <div className="col-md-4 mb-3">
                                <Input
                                    type="text"
                                    placeholder="Área de domínio"
                                    value={selectedUser.role}
                                    disabled
                                />
                            </div>
                            <div className="col-md-4 mb-3">
                                <Input
                                    type="text"
                                    placeholder="Área de domínio"
                                    value={selectedUser.professorTipo}
                                    disabled
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <Input
                                    type="text"
                                    placeholder="Descrição do professor"
                                    value={selectedUser.descricaoProfessor}
                                    disabled
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <h3>Turmas Vinculadas:</h3>

                                    {turmas.map((t) => {
                                        const isLinked = (selectedUser.turmasSelecionadas || []).includes(t.pk_turma);
                                        return (
                                            <p key={t.pk_turma} className="d-block" style={{ margin: '5px 0' }}>
                                                <IconWrapper isLinked={isLinked}>
                                                    {isLinked ? <FaCheckCircle /> : <FaTimesCircle />}
                                                </IconWrapper>
                                                {t.nm_turma}
                                            </p>
                                        );
                                    })}

                                    {turmas.length === 0 && (
                                        <p>Nenhuma turma cadastrada no sistema.</p>
                                    )}

                                    {turmas.length > 0 && (selectedUser.turmasSelecionadas || []).length === 0 && (
                                        <p>Este usuário não está vinculado a nenhuma turma ativa.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <CloseButton onClick={onClose}>Fechar</CloseButton>
                <AlterPassword onClick={togglePasswordModal}>Alterar Senha</AlterPassword>
            </ModalContainer>

            {/* Modal de Alteração de Senha */}
            {isPasswordModalOpen && <ModalPassword onClose={togglePasswordModal} userId={user?.id} />}
        </Overlay>
    );
};

export default User;

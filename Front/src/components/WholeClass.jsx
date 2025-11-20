import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import InfoPointsStudants from "./InfoPointsStudants";
import Loading from "./Loading";
import { GoAlert } from "react-icons/go";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 1000px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
  margin: 5px 15px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--DwBoldGray);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  background-color: var(--DwBoldGray);
  padding: 10px;
  color: white;
  border: none;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid transparent;
`;

const DeleteButton = styled.button`
  background: var(--DwBoldGray);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
`;

const Editar = styled.button`
  background: var(--DwYellow);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 4px;
`;

const Info = styled.button`
  background: var(--DwYellow);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 4px;
`;


const Danger = styled.p`
    color: red;
    margin-top: 5px;
`

const ButtonConfirm = styled.button`
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
`

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  margin-top: 5px;
  width: 100%;
`;

const ModalDelete = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// Caixa do modal
const ModalBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  text-align: center;
`;

// Botões
const ButtonConfirmDelete = styled.button`
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: red;
`;

const ButtonCancelDelete = styled.button`
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: var(--DwMediumGray);
`;


const WholeClass = ({ isOpen, onClose, turma, onUpdateAlunos }) => {
    const [alunos, setAlunos] = useState([]);
    const [error, setError] = useState(null);
    const [confirmation, setConfirmation] = useState({ open: false, alunoNome: "", alunoId: "" });
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [selectedInfoAluno, setSelectedInfoAluno] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [turmaSelecionada, setTurmaSelecionada] = useState("null");
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (isOpen && turma) {
            setTurmaSelecionada(turma.id);  // ID
        }
    }, [isOpen, turma]);



    const handleInfo = (aluno) => {
        setSelectedInfoAluno(aluno);
    };

    useEffect(() => {
        fetchAlunos();
        fetchTurmas();
    }, []);


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

    const handleDelete = (id, nome) => {
        setConfirmation({ open: true, alunoNome: nome, alunoId: id });
    };

    const confirmDelete = () => {

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado.");
            return;
        }

        axios.delete(`https://escolinha.paranoa.com.br/api/professores/alunos/${confirmation.alunoId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(() => {
                setAlunos((prevAlunos) => prevAlunos.filter((aluno) => aluno.id !== confirmation.alunoId));
                setConfirmation({ open: false, alunoNome: "", alunoId: "" });
                if (onUpdateAlunos) onUpdateAlunos();
            })
            .catch((error) => {
                alert("Erro ao excluir aluno.");
                console.error(error);
            });


        if (onUpdateAlunos) onUpdateAlunos();
    };

    const handleEdit = async (aluno) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `https://escolinha.paranoa.com.br/api/me/usuarios/${aluno.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;

            setSelectedAluno({
                id: data.pk_usuario,
                nome: data.nm_usuario,
                email: data.ds_email,
                cpf: data.nr_cpf,
                nasc: data.dt_nascimento?.split("T")[0] || "",

                role: data.tp_usuario,
                professorTipo: data.id_professor_tipo || "",

                endereco: data.endereco || {
                    ds_logradouro: "",
                    ds_numero: "",
                    ds_complemento: "",
                    nm_bairro: "",
                    nm_cidade: "",
                    sg_estado: "",
                    nr_cep: ""
                },

                turmasSelecionadas: data.turmas?.map(t => t.pk_turma) || []
            });

        } catch (error) {
            console.error("Erro ao buscar aluno completo", error);
        }
    };




    const handleSave = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado.");
            return;
        }
        setLoading(true);

        const payload = {
            nome: selectedAluno.nome,
            email: selectedAluno.email,
            nasc: selectedAluno.nasc,
            role: selectedAluno.role,
            endereco: selectedAluno.endereco,
            turmas: selectedAluno.turmasSelecionadas
        };

        try {
            await axios.put(`https://escolinha.paranoa.com.br/api/professores/alunos/${selectedAluno.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await fetchAlunos();
            if (onUpdateAlunos) onUpdateAlunos();
            setSelectedAluno(null);

        } catch (error) {
            alert("Erro ao salvar as alterações.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const alunosDaTurma = alunos.filter(a =>
        (a.turmas || []).some(t => String(t.pk_turma) === String(turmaSelecionada))
    );





    if (!isOpen) return null;
    if (error) return <p>{error}</p>;

    return (
        <ModalOverlay onClick={onClose}>
            <Loading show={loading} />
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <h2>{turma?.nome ?? "Turma"} </h2>
                <Input
                    type="text"
                    placeholder="Pesquisar aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <p>Aqui você pode visualizar os dados da turma inteira.</p>
                <CloseButton onClick={onClose}>X</CloseButton>

                <Table>
                    <thead>
                        <tr>
                            <Th>Nome</Th>
                            <Th>Email</Th>
                            <Th>Ações</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {alunosDaTurma.map((aluno) => (
                            <tr key={aluno.id}>
                                <Td>{aluno.nome}</Td>
                                <Td>{aluno.email}</Td>
                                <Td>
                                    <Info onClick={() => handleInfo(aluno)}>
                                        Check's
                                    </Info>


                                    <Editar onClick={() => handleEdit(aluno)}>
                                        Editar
                                    </Editar>

                                    <DeleteButton onClick={() => handleDelete(aluno.id, aluno.nome)}>
                                        Excluir
                                    </DeleteButton>


                                </Td>
                            </tr>
                        ))}

                    </tbody>
                </Table>
                {selectedAluno && (
                    <ModalOverlay onClick={() => setSelectedAluno(null)}>
                        <ModalContent onClick={(e) => e.stopPropagation()}>
                            <h2>Editar {selectedAluno.nome} </h2>
                            <CloseButton onClick={() => setSelectedAluno(null)}>X</CloseButton>

                            <form onSubmit={handleSave}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <Input
                                            type="text"
                                            placeholder="Nome Completo"
                                            value={selectedAluno.nome}
                                            onChange={(e) => setSelectedAluno({ ...selectedAluno, nome: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Input
                                            type="email"
                                            placeholder="E-mail"
                                            value={selectedAluno.email}
                                            onChange={(e) => setSelectedAluno({ ...selectedAluno, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <Input
                                            type="text"
                                            placeholder="CPF"
                                            value={selectedAluno.cpf}
                                            disabled
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <Input
                                            type="date"
                                            value={selectedAluno.nasc}
                                            onChange={(e) => setSelectedAluno({ ...selectedAluno, nasc: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Endereço */}
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <Input
                                            type="text"
                                            placeholder="Logradouro"
                                            value={selectedAluno.endereco.ds_logradouro}
                                            onChange={(e) =>
                                                setSelectedAluno({
                                                    ...selectedAluno,
                                                    endereco: { ...selectedAluno.endereco, ds_logradouro: e.target.value }
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="col-md-2 mb-3">
                                        <Input
                                            type="number"
                                            placeholder="Número"
                                            value={selectedAluno.endereco.ds_numero}
                                            onChange={(e) =>
                                                setSelectedAluno({
                                                    ...selectedAluno,
                                                    endereco: { ...selectedAluno.endereco, ds_numero: e.target.value }
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Input
                                            type="text"
                                            placeholder="Complemento"
                                            value={selectedAluno.endereco.ds_complemento}
                                            onChange={(e) =>
                                                setSelectedAluno({
                                                    ...selectedAluno,
                                                    endereco: { ...selectedAluno.endereco, ds_complemento: e.target.value }
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <Input
                                            type="text"
                                            placeholder="Bairro"
                                            value={selectedAluno.endereco.nm_bairro}
                                            onChange={(e) =>
                                                setSelectedAluno({
                                                    ...selectedAluno,
                                                    endereco: { ...selectedAluno.endereco, nm_bairro: e.target.value }
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Input
                                            type="text"
                                            placeholder="Cidade"
                                            value={selectedAluno.endereco.nm_cidade}
                                            onChange={(e) =>
                                                setSelectedAluno({
                                                    ...selectedAluno,
                                                    endereco: { ...selectedAluno.endereco, nm_cidade: e.target.value }
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="col-md-4 mb-3">
                                        <Input
                                            type="text"
                                            maxLength={2}
                                            placeholder="UF"
                                            value={selectedAluno.endereco.sg_estado}
                                            onChange={(e) =>
                                                setSelectedAluno({
                                                    ...selectedAluno,
                                                    endereco: { ...selectedAluno.endereco, sg_estado: e.target.value.toUpperCase() }
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <Input
                                            type="text"
                                            placeholder="CEP"
                                            value={selectedAluno.endereco.nr_cep}
                                            onChange={(e) =>
                                                setSelectedAluno({
                                                    ...selectedAluno,
                                                    endereco: { ...selectedAluno.endereco, nr_cep: e.target.value }
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <p>Turmas:</p>

                                        {turmas.map((t) => (
                                            <label key={t.pk_turma} className="d-block">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAluno.turmasSelecionadas.includes(t.pk_turma)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        const id = t.pk_turma;

                                                        setSelectedAluno({
                                                            ...selectedAluno,
                                                            turmasSelecionadas: checked
                                                                ? [...selectedAluno.turmasSelecionadas, id]
                                                                : selectedAluno.turmasSelecionadas.filter((x) => x !== id)
                                                        });
                                                    }}
                                                />
                                                {t.nm_turma}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {selectedAluno.role === "professor" && (
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <Input
                                                type="text"
                                                placeholder="Área de domínio"
                                                value={selectedAluno.professorTipo}
                                                onChange={(e) =>
                                                    setSelectedAluno({ ...selectedAluno, professorTipo: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <Input
                                                type="text"
                                                placeholder="Descrição do professor"
                                                value={selectedAluno.descricaoProfessor}
                                                onChange={(e) =>
                                                    setSelectedAluno({ ...selectedAluno, descricaoProfessor: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                <ButtonConfirm type="submit">Salvar</ButtonConfirm>
                            </form>


                        </ModalContent>
                    </ModalOverlay>
                )}



                {confirmation.open && (
                    <ModalDelete>
                        <ModalBox>
                            <GoAlert size={48} color="red" />
                            <Danger>
                                Você está prestes a excluir o aluno {confirmation.alunoNome} para sempre.
                            </Danger>
                            <ButtonConfirmDelete onClick={confirmDelete}>Confirmar</ButtonConfirmDelete>
                            <ButtonCancelDelete onClick={() => setConfirmation({ open: false, alunoNome: "", alunoId: "" })}>
                                Cancelar
                            </ButtonCancelDelete>
                        </ModalBox>
                    </ModalDelete>
                )}

                {selectedInfoAluno && (
                    <InfoPointsStudants
                        aluno={selectedInfoAluno}
                        turmaId={turmaSelecionada}
                        onClose={() => setSelectedInfoAluno(null)}
                    />
                )}
            </ModalContent>
        </ModalOverlay>
    );
};

export default WholeClass;

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import InfoPointsStudants from "./InfoPointsStudants";
import Loading from "./Loading";

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: bold;
  text-align: left;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  margin-top: 5px;
`;

const Select = styled.select`
  order: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  padding: 10px;
  margin-top: 5px;
  margin-left: 5px
`;


const WholeClass = ({ isOpen, onClose }) => {
    const [alunos, setAlunos] = useState([]);
    const [error, setError] = useState(null);
    const [confirmation, setConfirmation] = useState({ open: false, alunoNome: "", alunoId: "" });
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [selectedInfoAluno, setSelectedInfoAluno] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [turmaSelecionada, setTurmaSelecionada] = useState("todos");
    const [loading, setLoading] = useState(false);



    const handleInfo = (aluno) => {
        setSelectedInfoAluno(aluno);
    };

    useEffect(() => {
        const fetchAlunos = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Você não está autenticado.");
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get("https://escolinha.paranoa.com.br/api/professores/alunos", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const alunosFiltrados = response.data
                    .filter((aluno) => aluno.role === "aluno")
                    .sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena por nome

                setAlunos(alunosFiltrados);
            } catch (error) {
                setError("Erro ao carregar alunos");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlunos()

    }, []);

    const handleDelete = (id, nome) => {
        setConfirmation({ open: true, alunoNome: nome, alunoId: id });
    };

    const confirmDelete = () => {
        const nomeDigitado = prompt(`Digite o nome de ${confirmation.alunoNome} para confirmar a exclusão:`);
        if (nomeDigitado === confirmation.alunoNome) {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Você não está autenticado.");
                return;
            }

            axios
                .delete(`https://escolinha.paranoa.com.br/api/professores/alunos/${confirmation.alunoId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then(() => {
                    setAlunos((prevAlunos) => prevAlunos.filter((aluno) => aluno.id !== confirmation.alunoId));
                    setConfirmation({ open: false, alunoNome: "", alunoId: "" });
                })
                .catch((error) => {
                    alert("Erro ao excluir aluno.");
                    console.error(error);
                });
        } else {
            alert("O nome digitado não corresponde ao nome do aluno.");
        }
    };

    const handleEdit = (aluno) => {
        console.log(new Date("2002-03-08T00:00:00.000+00:00").toISOString().split('T')[0]);
        const dataFormatada = aluno.nasc
            ? new Date(aluno.nasc).toISOString().split('T')[0]
            : '';

        setSelectedAluno({
            ...aluno,
            nasc: dataFormatada, 
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado.");
            return;
        }
        setLoading(true);
        try {
            await axios.put(`https://escolinha.paranoa.com.br/api/professores/alunos/${selectedAluno.id}`, selectedAluno, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAlunos((prevAlunos) =>
                prevAlunos.map((aluno) => (aluno.id === selectedAluno.id ? selectedAluno : aluno))
            );

            setSelectedAluno(null);
        } catch (error) {
            alert("Erro ao salvar as alterações.");
            console.error(error);
        } finally {
            setLoading(false); // Desativa o carregamento
        }
    };

    const alunosFiltrados = alunos.filter((aluno) => {
        const nomeFiltrado = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const turmaFiltrada = turmaSelecionada === "todos" || aluno.turma === turmaSelecionada;
        return nomeFiltrado && turmaFiltrada;
    });




    if (!isOpen) return null;
    if (error) return <p>{error}</p>;

    return (
        <ModalOverlay onClick={onClose}>
            <Loading show={loading} />
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <h2>{turmaSelecionada.toUpperCase()}</h2>
                <Input
                    type="text"
                    placeholder="Pesquisar aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Select value={turmaSelecionada} onChange={(e) => setTurmaSelecionada(e.target.value)}>
                    <option value="todos">Todos</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                </Select>



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
                        {alunosFiltrados.map((aluno) => (
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
                            <h2>Editar Aluno</h2>
                            <CloseButton onClick={() => setSelectedAluno(null)}>X</CloseButton>

                            <Form onSubmit={handleSave}>
                                <Label>
                                    Nome:
                                    <Input
                                        type="text"
                                        value={selectedAluno.nome}
                                        onChange={(e) => setSelectedAluno({ ...selectedAluno, nome: e.target.value })}
                                    />
                                </Label>

                                <Label>
                                    Email:
                                    <Input
                                        type="email"
                                        value={selectedAluno.email}
                                        onChange={(e) => setSelectedAluno({ ...selectedAluno, email: e.target.value })}
                                    />
                                </Label>

                                <Label>
                                    CPF:
                                    <Input
                                        type="text"
                                        value={selectedAluno.cpf}
                                        onChange={(e) => setSelectedAluno({ ...selectedAluno, cpf: e.target.value })}
                                        disabled
                                    />
                                </Label>

                                <Label>
                                    Nascimento:
                                    <Input
                                        type="date"
                                        value={selectedAluno.nasc || ''}
                                        onChange={(e) => setSelectedAluno({
                                            ...selectedAluno,
                                            nasc: e.target.value
                                        })}
                                    />
                                </Label>


                                <Label>
                                    Endereço:
                                    <Input
                                        type="text"
                                        value={selectedAluno.endereco}
                                        onChange={(e) => setSelectedAluno({ ...selectedAluno, endereco: e.target.value })}
                                    />
                                </Label>

                                <Label>
                                    Turma:
                                    <Select
                                        value={selectedAluno.turma}
                                        onChange={(e) => setSelectedAluno({ ...selectedAluno, turma: e.target.value })}
                                    >
                                        <option value="manha">Manhã</option>
                                        <option value="tarde">Tarde</option>
                                    </Select>
                                </Label>

                                <ButtonConfirm type="submit">Salvar</ButtonConfirm>
                            </Form>
                        </ModalContent>
                    </ModalOverlay>
                )}



                {confirmation.open && (
                    <div>
                        <Danger>Você está prestes a excluir o aluno {confirmation.alunoNome} para sempre. Para confirmar, digite o nome completo do aluno.</Danger>
                        <ButtonConfirm onClick={confirmDelete}>Confirmar</ButtonConfirm>
                        <ButtonConfirm onClick={() => setConfirmation({ open: false, alunoNome: "", alunoId: "" })}>Cancelar</ButtonConfirm>
                    </div>
                )}

                {selectedInfoAluno && (
                    <InfoPointsStudants
                        aluno={selectedInfoAluno}
                        onClose={() => setSelectedInfoAluno(null)}
                    />
                )}
            </ModalContent>
        </ModalOverlay>
    );
};

export default WholeClass;

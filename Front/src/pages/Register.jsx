import { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Loading from "../components/Loading";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const FormWrapper = styled.div`
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  width: 90%;
  margin-top: 40px;
`;

const Title = styled.h2`
  margin-bottom: 24px;
  font-size: 24px;
  text-align: center;
  color: #212529;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.2rem rgba(13,110,253,0.25);
    outline: none;
  }

  & + & {
    margin-top: 12px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 15px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.2rem rgba(13,110,253,0.25);
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background-color: var(--DwYellow);
  color: #000;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background-color: var(--DwBoldGray);
    color: #fff;
  }
`;

const Message = styled.p`
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
  color: ${(props) => (props.error ? "#dc3545" : "#198754")};
`;


function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [nasc, setNasc] = useState("");
  const [endereco, setEndereco] = useState({
    ds_logradouro: "",
    ds_numero: "",
    ds_complemento: "",
    nm_bairro: "",
    nm_cidade: "",
    sg_estado: "",
    nr_cep: "",
  });

  const [role, setRole] = useState("aluno");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [professorTipo, setProfessorTipo] = useState(null);
  const [descricaoProfessor, setDescricaoProfessor] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState([]);



  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/professores/turmas",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTurmas(response.data);

      } catch (error) {
        console.error("Erro ao buscar turmas", error);
      }
    };

    fetchTurmas();
  }, []);



  const formatCpf = (value) => {
    value = value.replace(/\D/g, "");
    value = value.slice(0, 11);

    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }

    return value;
  };

  const handleCpfChange = (e) => {
    setCpf(formatCpf(e.target.value));
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/professores/usuarios",
        {
          nome: name,
          email,
          senha: password,
          nasc,
          cpf,
          endereco,
          role,
          professorTipo: professorTipo
            ? { nomeTipo: professorTipo, descricao: descricaoProfessor }
            : null,
          turmas: turmasSelecionadas
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.msg);
      setIsError(false);

      setName("");
      setEmail("");
      setPassword("");
      setCpf("");
      setNasc("");
      setRole("aluno");
      setProfessorTipo(null);
      setDescricaoProfessor(null);
      setEndereco({
        ds_logradouro: "",
        ds_numero: "",
        ds_complemento: "",
        nm_bairro: "",
        nm_cidade: "",
        sg_estado: "",
        nr_cep: "",
      });

    } catch (error) {
      setMessage(error.response?.data?.msg || "Erro ao cadastrar usuário");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Loading show={loading} />
      <FormWrapper>
        <Title>Cadastro</Title>
        <form onSubmit={handleRegister}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <Input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <Input
                type="text"
                placeholder="CPF"
                value={cpf}
                onChange={handleCpfChange}
                maxLength="14"
                required
              />
            </div>
          </div>

          {/* Data de nascimento */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <Input
                type="date"
                value={nasc}
                onChange={(e) => setNasc(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <Input
                type="text"
                placeholder="Logradouro"
                value={endereco.ds_logradouro}
                onChange={(e) => setEndereco({ ...endereco, ds_logradouro: e.target.value })}
              />
            </div>

            <div className="col-md-2 mb-3">
              <Input
                type="number"
                placeholder="Número"
                value={endereco.ds_numero}
                onChange={(e) => setEndereco({ ...endereco, ds_numero: e.target.value })}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <Input
                type="text"
                placeholder="Complemento"
                value={endereco.ds_complemento}
                onChange={(e) => setEndereco({ ...endereco, ds_complemento: e.target.value })}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Input
                type="text"
                placeholder="Bairro"
                value={endereco.nm_bairro}
                onChange={(e) => setEndereco({ ...endereco, nm_bairro: e.target.value })}
              />
            </div>

            <div className="col-md-4 mb-3">
              <Input
                type="text"
                placeholder="Cidade"
                value={endereco.nm_cidade}
                onChange={(e) => setEndereco({ ...endereco, nm_cidade: e.target.value })}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <Input
                type="text"
                placeholder="UF"
                maxLength={2}
                value={endereco.sg_estado}
                onChange={(e) =>
                  setEndereco({ ...endereco, sg_estado: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="col-md-8 mb-3">
              <Input
                type="text"
                placeholder="CEP"
                value={endereco.nr_cep}
                onChange={(e) => setEndereco({ ...endereco, nr_cep: e.target.value })}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-3 mb-3">
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="professor">Professor</option>
                <option value="aluno">Aluno</option>
              </Select>
            </div>

            <div className="col-8">
              <p>Selecione as turmas:</p>

              {turmas.map((t) => (
                <label
                  key={t.pk_turma}
                  className="d-block text-left"
                  style={{ marginTop: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={turmasSelecionadas.includes(t.pk_turma)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTurmasSelecionadas([...turmasSelecionadas, t.pk_turma]);
                      } else {
                        setTurmasSelecionadas(
                          turmasSelecionadas.filter((id) => id !== t.pk_turma)
                        );
                      }
                    }}
                  />
                  <span className="ml-2">{t.nm_turma}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Campos extras para professor */}
          {role === "professor" && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <Input
                  type="text"
                  placeholder="Área de domínio"
                  value={professorTipo}
                  onChange={(e) => setProfessorTipo(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <Input
                  type="text"
                  placeholder="Descrição do professor"
                  value={descricaoProfessor}
                  onChange={(e) => setDescricaoProfessor(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <Button type="submit">Cadastrar</Button>
        </form>

        {message && <Message error={isError}>{message}</Message>}
      </FormWrapper>
    </Container>
  );
}

export default Register;

import { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import Loading from "../components/Loading";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding-bottom: 100px;
`;

const FormWrapper = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 350px;
  text-align: center;
  margin-top: 100px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  background: white;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background-color: var(--DwYellow);
  color: black;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;

  &:hover {
    background-color: var(--DwBoldGray);
    color: white;
  }
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 22px;
  color: #333;
`;

const Message = styled.p`
  font-size: 14px;
  margin-top: 10px;
  color: ${(props) => (props.error ? "red" : "green")};
`;

const RadioWrapper = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 10px;
`;

const RadioLabel = styled.label`
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  color: #333;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  /* círculo customizado */
  span {
    position: absolute;
    top: 0;
    left: 0;
    height: 18px;
    width: 18px;
    background-color: #fff;
    border: 2px solid #ccc;
    border-radius: 50%;
  }

  /* círculo preenchido quando selecionado */
  input:checked ~ span {
    background-color: var(--DwYellow);
    border-color: var(--DwYellow);
  }

  /* círculo interno */
  span::after {
    content: "";
    position: absolute;
    display: none;
  }

  input:checked ~ span::after {
    display: block;
    top: 4px;
    left: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: black;
  }
`;


function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [nasc, setNasc] = useState("");
  const [endereco, setEndereco] = useState("");
  const [turma, setTurma] = useState("manha");
  const [role, setRole] = useState("aluno");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [karate, setKarate] = useState(false);
  const [ginastica, setGinastica] = useState(false);
  const [professorTipo, setProfessorTipo] = useState(null);



  // Função para formatar o CPF
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
    const enviarKarate = turma === "karate" ? true : karate;
    const ginasticaKarate = turma === "ginastica" ? true : ginastica;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/professores/usuarios",
        { nome: name, email, senha: password, nasc, cpf, endereco, turma, role, professorTipo, karate: enviarKarate, ginastica: ginasticaKarate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.msg);
      setIsError(false);

      setName("");
      setEmail("");
      setPassword("");
      setCpf("");
      setNasc("");
      setEndereco("");
      setTurma("manha");
      setRole("aluno");
      setProfessorTipo("");
    } catch (error) {
      setMessage(error.response?.data?.msg || "Erro ao cadastrar usuário");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);

    // Se mudar para professor, reseta o karate
    if (newRole === "professor") {
      setKarate(false);
    }
  };


  return (
    <Container>
      <Loading show={loading} />
      <FormWrapper>
        <Title>Cadastro</Title>
        <form onSubmit={handleRegister}>
          <Input
            type="text"
            placeholder="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={handleCpfChange}
            maxLength="14"
            required
          />

          <Input
            type="date"
            placeholder="Data de Nascimento"
            value={nasc}
            onChange={(e) => setNasc(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required
          />

          <Select value={role} onChange={handleRoleChange}>
            <option value="professor">Professor</option>
            <option value="aluno">Aluno</option>
          </Select>


          {(role != "professor") && (
            <Select value={turma} onChange={(e) => setTurma(e.target.value)}>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="karate">Karatê</option>
              <option value="ginastica">Ginástica</option>
            </Select>
          )}

          {((turma === "manha" || turma === "tarde") && role !== "professor") && (
            <>
              Optou pelo Karatê?
              <RadioWrapper>

                <RadioLabel>
                  Sim
                  <input type="radio" name="karate" value="sim" onChange={() => setKarate(true)} />
                  <span></span>
                </RadioLabel>

                <RadioLabel>
                  Não
                  <input type="radio" name="karate" value="nao" onChange={() => setKarate(false)} defaultChecked />
                  <span></span>
                </RadioLabel>
              </RadioWrapper>

              Optou pelo Ginástica??
              <RadioWrapper>

                <RadioLabel>
                  Sim
                  <input type="radio" name="ginastica" value="sim" onChange={() => setGinastica(true)} />
                  <span></span>
                </RadioLabel>

                <RadioLabel>
                  Não
                  <input type="radio" name="ginastica" value="nao" onChange={() => setGinastica(false)} defaultChecked />
                  <span></span>
                </RadioLabel>
              </RadioWrapper>
            </>
          )}

          {(turma == "ginastica") && (
            <>
              Optou pelo Karatê?
              <RadioWrapper>

                <RadioLabel>
                  Sim
                  <input type="radio" name="karate" value="sim" onChange={() => setKarate(true)} />
                  <span></span>
                </RadioLabel>

                <RadioLabel>
                  Não
                  <input type="radio" name="karate" value="nao" onChange={() => setKarate(false)} defaultChecked />
                  <span></span>
                </RadioLabel>
              </RadioWrapper>
            </>
          )}

          {(turma == "karate") && (
            <>
              Optou pelo Ginástica?
              <RadioWrapper>

                <RadioLabel>
                  Sim
                  <input type="radio" name="karate" value="sim" onChange={() => setGinastica(true)} />
                  <span></span>
                </RadioLabel>

                <RadioLabel>
                  Não
                  <input type="radio" name="karate" value="nao" onChange={() => setGinastica(false)} defaultChecked />
                  <span></span>
                </RadioLabel>
              </RadioWrapper>
            </>
          )}

          {((role == "professor") && (
            <>
              Professor do(a):
              <RadioWrapper>

                <RadioLabel>
                  Escola Digital
                  <input type="radio" name="professorTipo" value="tecnologia" onChange={() => setProfessorTipo("tecnologia")} />
                  <span></span>
                </RadioLabel>

                <RadioLabel>
                  Karatê
                  <input type="radio" name="professorTipo" value="karate" onChange={() => setProfessorTipo("karate")} />
                  <span></span>
                </RadioLabel>

                <RadioLabel>
                  Ginastica
                  <input type="radio" name="professorTipo" value="ginastica" onChange={() => setProfessorTipo("ginastica")} />
                  <span></span>
                </RadioLabel>

              </RadioWrapper>
            </>
          ))}


          <Button type="submit">Cadastrar</Button>
        </form>
        {message && <Message error={isError}>{message}</Message>}
      </FormWrapper>
    </Container>
  );
}

export default Register;

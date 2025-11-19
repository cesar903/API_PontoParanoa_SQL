import { useState, useEffect } from "react";
import styled from "styled-components";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import ManualPoint from "./ManualPoint";
import Graph from "./Graph";
import Loading from "./Loading";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch; 
  background-color: #f8f8f8;
  padding-top: 5rem;
  height: 100vh;
`;

const ContainerSwitche = styled.div`
  display: flex;
  justify-content: center     ;
`

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
`;

const ModalBox = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  z-index: 9999; 
  
`;


const TurmaButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background-color: var(--DwYellow);
  color: black;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;



const Clock = styled.div`
  font-size: 10rem;
  font-weight: bold;
  color: var(--DwLightGray);
  display: flex;
  align-items: center;
  
  justify-content: center;
  @media (max-width: 768px) {
    font-size: 3em;
  }
`;

const TimeUnit = styled.span`
  margin: 0 10px;
  font-size: 1.5rem;
`;


const SwitchContainer = styled.div`
  width: 90%;
  max-width: 400px;
  height: 80px;
  background-color: ${(props) => (props.$isOn ? "var(--DwYellow)" : "var(--DwMediumGray)")};
  border-radius: 50px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isOn ? "flex-end" : "flex-start")};
  padding: 5px;
  transition: background-color 0.3s ease-in-out, justify-content 0.3s ease-in-out;
  margin: 20px auto;
  box-shadow: 0px 0px 10px 5px rgba(233, 217, 217, 0.5);

  @media (max-width: 480px) {
    height: 60px;
  }
`;

const Slider = styled.div`
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  left: ${(props) => (props.$isOn ? "calc(100% - 65px)" : "5px")};
  transition: left 0.3s ease-in-out;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    width: 45px;
    height: 45px;
    left: ${(props) => (props.$isOn ? "calc(100% - 50px)" : "5px")};
  }
`;


const Label = styled.span`
  position: absolute;
  left: ${(props) => (props.$isOn ? "50px" : "100px")};
  font-size: 2rem;
  color: white;
  font-weight: bold;
  transition: left 0.3s ease-in-out;
  margin-top: 6px;
  

  @media (max-width: 768px) {
    font-size: 1.5rem;
    left: ${(props) => (props.$isOn ? "40px" : "80px")};
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    left: ${(props) => (props.$isOn ? "30px" : "60px")};
  }
`;


function CheckInOut() {
  const [time, setTime] = useState({
    hours: new Date().getHours(),
    minutes: new Date().getMinutes(),
    seconds: new Date().getSeconds(),
  });
  const [isOn, setIsOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [turmas, setTurmas] = useState([]);
  const [showModalTurmas, setShowModalTurmas] = useState(false);
  const [turmaEscolhida, setTurmaEscolhida] = useState(null);


  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    }, 1000);

    return () => clearInterval(timer);
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
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
      }
    };

    fetchTurmas();
  }, []);


  useEffect(() => {
    const fetchPonto = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Você não está autenticado. Faça login novamente.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("https://escolinha.paranoa.com.br/api/alunos/pontos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pontos = response.data;
        const ultimoPonto = pontos.length > 0 ? pontos[pontos.length - 1] : null;

        if (ultimoPonto) {
          setIsOn(ultimoPonto.fl_is_on);
        }
      } catch (error) {
        console.error("Erro ao buscar o estado do check-in:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPonto();
  }, []);

  const handleClick = async () => {
    if (processing) return;
    setLoading(true);
    setProcessing(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você não está autenticado. Faça login novamente.");
      setProcessing(false);
      setLoading(false);
      return;
    }

    const latitude = 0;
    const longitude = 0;

    try {
      if (isOn) {
        const confirmExit = window.confirm("Você deseja encerrar o check-in?");
        if (confirmExit) {
          await axios.post(
            "https://escolinha.paranoa.com.br/api/alunos/checkout",
            { latitude, longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsOn(false);
        }
      } else {
        if (!isOn) {

          if (turmas.length === 1) {
            confirmarCheckin(turmas[0].id);
          }
          else if (turmas.length > 1) {
            setShowModalTurmas(true);
          }
          else {
            alert("Nenhuma turma encontrada!");
          }
          return;
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      alert(error?.response?.data?.msg || "Erro ao processar check-in.");
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const confirmarCheckin = async (id_turma) => {
    setShowModalTurmas(false);
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "https://escolinha.paranoa.com.br/api/alunos/ponto",
        { latitude: 0, longitude: 0, id_turma },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsOn(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar check-in.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container >
      {showModalTurmas && (
        <ModalBackground>
          <ModalBox>
            <h3>Selecione a turma</h3>

            {turmas.map((turma) => (
              <TurmaButton
                key={turma.id}
                onClick={() => {
                  setTurmaEscolhida(turma);
                  confirmarCheckin(turma.id);
                }}
              >
                {turma.nome}
              </TurmaButton>
            ))}

            <TurmaButton
              style={{ background: "gray", color: "white" }}
              onClick={() => setShowModalTurmas(false)}
            >
              Cancelar
            </TurmaButton>
          </ModalBox>
        </ModalBackground>
      )}

      <Loading show={loading} />
      <Clock>
        {String(time.hours).padStart(2, "0")} <TimeUnit>h</TimeUnit>
        {String(time.minutes).padStart(2, "0")} <TimeUnit>m</TimeUnit>
        {String(time.seconds).padStart(2, "0")} <TimeUnit>s</TimeUnit>
      </Clock>

      <ContainerSwitche>
        <SwitchContainer $isOn={isOn} onClick={processing ? null : handleClick}>
          <Label $isOn={isOn}>{isOn ? "Check-Out" : "Check-In"}</Label>
          <Slider $isOn={isOn}>
            {isOn ? <FaArrowLeft color="var(--DwYellow)" /> : <FaArrowRight color="var(--DwMediumGray)" />}
          </Slider>
        </SwitchContainer>
      </ContainerSwitche>

      {isOn ? "" : <ManualPoint />}

      {/* <Graph /> */}
      {/* Possivel retornar grafico de alunos */}


    </Container>
  );
}

export default CheckInOut;

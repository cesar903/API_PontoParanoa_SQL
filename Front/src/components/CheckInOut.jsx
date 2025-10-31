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
    const fetchPonto = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Você não está autenticado. Faça login novamente.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/alunos/pontos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pontos = response.data;
        const ultimoPonto = pontos.length > 0 ? pontos[pontos.length - 1] : null;

        if (ultimoPonto) {
          setIsOn(ultimoPonto.isOn);
        }
      } catch (error) {
        console.error("Erro ao buscar o estado do check-in:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPonto();
  }, []);

  // Envio com localização
  // const handleClick = async () => {
  //   if (processing) return; // Impede múltiplos envios
  //   setLoading(true);
  //   setProcessing(true); 

  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     alert("Você não está autenticado. Faça login novamente.");
  //     setProcessing(false);
  //     setLoading(false);
  //     return;
  //   }

  //   if ("geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setLoading(true);
  //         try {
  //           if (isOn) {
  //             const confirmExit = window.confirm("Você tem certeza de que deseja encerrar o check-in? Não poderá adicionar um novo check-in durante o dia.");
  //             if (confirmExit) {
  //               await axios.post(
  //                 "http://localhost:5000/api/alunos/checkout",
  //                 { latitude, longitude },
  //                 { headers: { Authorization: `Bearer ${token}` } }
  //               );
  //               setIsOn(false);
  //             }
  //           } else {
  //             await axios.post(
  //               "http://localhost:5000/api/alunos/ponto",
  //               { latitude, longitude },
  //               { headers: { Authorization: `Bearer ${token}` } }
  //             );
  //             setIsOn(true);
  //           }
  //         } catch (error) {
  //           console.error("Erro ao realizar check-in/out:", error);
  //           alert(error?.response?.data?.msg || "Não foi possível realizar check-in/out.");
  //         } finally {
  //           setProcessing(false); 
  //           setLoading(false); 

  //         }
  //       },
  //       (error) => {
  //         alert("Erro ao acessar a localização. Ative o GPS e tente novamente.");
  //         console.error(error);
  //         setProcessing(false);
  //         setLoading(false);
  //       }
  //     );
  //   } else {
  //     alert("Geolocalização não suportada pelo seu navegador.");
  //     setProcessing(false);
  //     setLoading(false);
  //   }
  // };


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

    // Localização fixa 
    const latitude = 0;
    const longitude = 0;

    try {
      if (isOn) {
        const confirmExit = window.confirm(
          "Você tem certeza de que deseja encerrar o check-in? Não poderá adicionar um novo check-in durante o dia."
        );
        if (confirmExit) {
          await axios.post(
            "http://localhost:5000/api/alunos/checkout",
            { latitude, longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsOn(false);
        }
      } else {
        await axios.post(
          "http://localhost:5000/api/alunos/ponto",
          { latitude, longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsOn(true);
      }
    } catch (error) {
      console.error("Erro ao realizar check-in/out:", error);
      alert(error?.response?.data?.msg || "Não foi possível realizar check-in/out.");
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };


  return (
    <Container >
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

    </Container>
  );
}

export default CheckInOut;

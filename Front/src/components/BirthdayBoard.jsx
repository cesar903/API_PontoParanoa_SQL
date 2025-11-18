import { useEffect, useState } from "react";
import axios from "axios";
import { FaCakeCandles } from "react-icons/fa6";
import styled from "styled-components";
import Loading from "./Loading";


const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: solid var(--DwYellow) 2px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    color: #555;
  }

  .legend-date {
    font-weight: bold;
    color: #222;
  }
`;


const BirthdayBoard = ({ turmaId }) => {
    const [aniversariantes, setAniversariantes] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchAniversariantes = async () => {
          try {
            const response = await axios.get("http://localhost:5000/api/alunos/aniversariantes", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              },
              params: { turmaId }
            });
      
            const hoje = new Date();
            const mesAtual = hoje.getMonth() + 1; // getMonth() é de 0 a 11
      
            const filtrados = response.data.filter(aluno => {
              const [ano, mes, dia] = aluno.nasc.split("T")[0].split("-").map(Number);
              return mes === mesAtual;
            });
      
            const ordenados = filtrados.sort((a, b) => {
              const [_, __, diaA] = a.nasc.split("T")[0].split("-").map(Number);
              const [___, ____, diaB] = b.nasc.split("T")[0].split("-").map(Number);
              return diaA - diaB;
            });
      
            setAniversariantes(ordenados);
      
          } catch (error) {
            console.error("Erro ao buscar aniversariantes:", error);
          } finally {
            setLoading(false);
          }
        };
      
        fetchAniversariantes();
      }, [turmaId]);
      

    const formatarData = (dataStr) => {
        const partes = dataStr.split("T")[0].split("-");
        const ano = partes[0];
        const mes = partes[1];
        const dia = partes[2];
        return `${dia}/${mes}`;
      };
      

    return (
        <LegendContainer className="notice-board">
            <h4>Aniversariantes do Mês</h4>
            {loading ? (
                <Loading />
            ) : aniversariantes.length === 0 ? (
                <p>Nenhum aniversariante este mês.</p>
            ) : (
                aniversariantes.map((aluno) => (
                    <div key={aluno.id} className="legend-item">
                        <span><FaCakeCandles color="#f39c12"/> {aluno.nome} </span>
                        <span className="legend-date">{formatarData(aluno.nasc)}</span>
                    </div>
                ))
            )}
        </LegendContainer>
    );
};

export default BirthdayBoard;

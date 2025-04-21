import { useState, useEffect } from "react";
import axios from "axios";
import styled from 'styled-components';
import { FaCheck, FaExclamationTriangle, FaClock } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Table = styled.table`
  margin-top: 40px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  font-weight: 700;
  border-radius: 10px;
  overflow: hidden;

  th, td {
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #0a0a09;
    color: white;
  }
`;

const StatusCell = styled.td`
  background-color: ${props => {
    if (props.$status === 'aprovado') return '#82f89e'; 
    if (props.$status === 'rejeitado') return '#f17b85';
    return '#f6f0f0';  
  }};
  font-weight: bold;
`;

const TableRow = styled.tr`
  background-color: ${props => {
    if (props.$status === 'aprovado') return '#82f89e';  
    if (props.$status === 'rejeitado') return '#f17b85';  
    return '#f6f0f0';  
  }};
`;

const SeletorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
  margin-top: 20px;
`;

const SeletorMes = styled(DatePicker)`
  padding: 8px;
  font-size: 14px;
  border: 1px solid var(--DwLightGray);
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  width: 120px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: var(--DwMediumGray);
  }
`;

function Verification() {
  const [pontos, setPontos] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState(new Date());
  const [pontosFiltrados, setPontosFiltrados] = useState([]);

  useEffect(() => {
    const fetchPontos = async () => {
      const token = localStorage.getItem("token"); 
      if (!token) {
        alert("Você não está autenticado.");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/alunos/pontos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPontos(response.data);
      } catch (error) {
        alert(error.response?.data?.msg || "Erro ao buscar os pontos.");
      }
    };

    fetchPontos();
  }, []);

  
  useEffect(() => {
    const filtroPontos = pontos.filter((ponto) => {
      const dataEntrada = new Date(ponto.entrada);
      const mesPonto = dataEntrada.getMonth(); // Mês da data de entrada
      const anoPonto = dataEntrada.getFullYear(); // Ano da data de entrada

      return mesPonto === mesSelecionado.getMonth() && anoPonto === mesSelecionado.getFullYear();
    });

    setPontosFiltrados(filtroPontos);
  }, [pontos, mesSelecionado]);

  const calcularTotalHoras = (entrada, saida) => {
    if (!entrada || !saida) return "—";

    const entradaDate = new Date(entrada);
    const saidaDate = new Date(saida);

    // Ajuste para o fuso horário local, se necessário
    const entradaLocal = new Date(entradaDate.getTime() - entradaDate.getTimezoneOffset() * 60000);
    const saidaLocal = new Date(saidaDate.getTime() - saidaDate.getTimezoneOffset() * 60000);

    if (isNaN(entradaLocal.getTime()) || isNaN(saidaLocal.getTime())) {
      return "Data inválida";
    }

    const diff = saidaLocal - entradaLocal;

    // Se a diferença for menor que zero, as datas podem estar erradas
    if (diff < 0) return "Erro no cálculo";

    // Calculando horas e minutos corretamente
    const horas = Math.floor(diff / (1000 * 60 * 60)); // Dividindo por milissegundos em uma hora
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); // Resto da diferença para minutos
    return `${horas}h ${minutos}m`;
  };

  return (
    <div className="container">
      <SeletorContainer>
        <label>Selecionar Mês:</label>
        <SeletorMes
          selected={mesSelecionado}
          onChange={(date) => setMesSelecionado(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
        />
      </SeletorContainer>

      <Table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Data</th>
            <th>Entrada</th>
            <th>Saída</th>
            <th>Total de Horas</th>
          </tr>
        </thead>
        <tbody>
          {pontosFiltrados.map((ponto) => (
            <TableRow key={ponto.id} $status={ponto.status}>
              <StatusCell $status={ponto.status}>
                {ponto.status === 'aprovado' && <FaCheck />}
                {ponto.status === 'rejeitado' && <FaExclamationTriangle />}
                {ponto.status === 'pendente' && <FaClock />}
              </StatusCell>
              <td>{new Date(ponto.entrada).toLocaleDateString()}</td>
              <td>{ponto.entrada ? new Date(ponto.entrada).toLocaleTimeString() : "—"}</td>
              <td>{ponto.saida ? new Date(ponto.saida).toLocaleTimeString() : "—"}</td>
              <td>{calcularTotalHoras(ponto.entrada, ponto.saida)}</td>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Verification;

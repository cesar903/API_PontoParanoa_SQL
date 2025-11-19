import { useState, useEffect } from "react";
import SelectClass from "../components/SelectClass";
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
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");

  useEffect(() => {
    const fetchPontos = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Você não está autenticado.");
        return;
      }

      try {
        const response = await axios.get("https://escolinha.paranoa.com.br/api/alunos/pontos", {
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
      if (!turmaSelecionada) return false;

      if (String(ponto.id_turma) !== String(turmaSelecionada)) return false;

      const entrada = new Date(ponto.dt_entrada);
      const sameMonth = entrada.getMonth() === mesSelecionado.getMonth();
      const sameYear = entrada.getFullYear() === mesSelecionado.getFullYear();
      return sameMonth && sameYear;
    });

    setPontosFiltrados(filtroPontos);
  }, [pontos, mesSelecionado, turmaSelecionada]);


  const calcularTotalHoras = (entrada, saida) => {
    if (!entrada || !saida) return "—";

    const entradaDate = new Date(entrada);
    const saidaDate = new Date(saida);

    const diff = saidaDate - entradaDate;

    if (diff < 0) return "Erro";

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${horas}h ${minutos}m`;
  };


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

        if (turmasRecebidas.length > 0) {
          setTurmaSelecionada(turmasRecebidas[0].id.toString());
        }
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
      }
    };

    fetchTurmas();
  }, []);



  return (
    <>
      <SelectClass
        value={turmaSelecionada}
        onChange={(e) => setTurmaSelecionada(e.target.value)}
        options={turmas}
        placeholder="Selecione uma turma"
      />

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
              <TableRow key={ponto.pk_ponto} $status={ponto.tp_status}>
                <StatusCell $status={ponto.tp_status}>
                  {ponto.tp_status === 'aprovado' && <FaCheck />}
                  {ponto.tp_status === 'rejeitado' && <FaExclamationTriangle />}
                  {ponto.tp_status === 'pendente' && <FaClock />}
                </StatusCell>

                <td>{new Date(ponto.dt_entrada).toLocaleDateString()}</td>
                <td>{ponto.dt_entrada ? new Date(ponto.dt_entrada).toLocaleTimeString() : "—"}</td>
                <td>{ponto.dt_saida ? new Date(ponto.dt_saida).toLocaleTimeString() : "—"}</td>

                <td>{calcularTotalHoras(ponto.dt_entrada, ponto.dt_saida)}</td>
              </TableRow>

            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default Verification;

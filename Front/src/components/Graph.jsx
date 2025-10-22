import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

const Grafico = styled.div`
    padding-top: 2rem;
`;
const Container = styled.div`
    text-align: center;
`

const Select = styled.select`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: auto;
  background-color: transparent;
`;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Graph = () => {
    const [alunos, setAlunos] = useState([]);
    const [turnoSelecionado, setTurnoSelecionado] = useState("manha");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado. Faça login novamente.");
            return;
        }

        const fetchData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get("https://escolinha.paranoa.com.br/api/alunos/pontos/com-alunos", { headers });

                // Mapear e filtrar os dados conforme o turno selecionado
                const alunosArray = Object.entries(response.data)
                    .map(([nome, dados]) => ({
                        nome,
                        horas: dados.horas,
                        turno: dados.turma, // Aqui estamos pegando a turma como o turno (manhã ou tarde)
                    }))
                    .filter(aluno => aluno.turno === turnoSelecionado) // Filtrando pelo turno
                    .sort((a, b) => b.horas - a.horas); // Ordenação por horas

                setAlunos(alunosArray);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
    }, [turnoSelecionado]); // Sempre que o turno mudar, a lista é atualizada

    // Função para formatar as horas
    const formatarHoras = (decimal) => {
        const horas = Math.floor(decimal);
        const minutos = Math.round((decimal - horas) * 60);
        return `${horas}h${minutos > 0 ? minutos + "min" : ""}`;
    };

    // Preparando os dados para o gráfico
    const labels = alunos.map(aluno => `${aluno.nome} (${formatarHoras(aluno.horas)})`);
    const valores = alunos.map(aluno => Math.round(aluno.horas * 60));

    const data = {
        labels,
        datasets: [
            {
                label: "Minutos",
                data: valores,
                backgroundColor: "#FDB913",
                borderColor: "#2D2D2D",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Comparação de Horas entre Alunos" },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const minutos = context.raw;
                        const horas = Math.floor(minutos / 60);
                        const restoMinutos = minutos % 60;
                        return `${horas}h${restoMinutos > 0 ? restoMinutos : ""}`;
                    },
                },
            },
        },
        scales: {
            x: { beginAtZero: true },
        },
    };

    // Altura dinâmica do gráfico
    const chartHeight = Math.max(400, labels.length * 40);

    return (
        <Container>
            {/* Seletor de turno */}
            <Select value={turnoSelecionado} onChange={(e) => setTurnoSelecionado(e.target.value)}>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="karate">Karatê</option>
            </Select>

            {/* Gráfico de barras */}
            <Grafico style={{ height: `${chartHeight}px` }}>
                <Bar data={data} options={options} />
            </Grafico>
        </Container>
    );
};

export default Graph;

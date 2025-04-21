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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Graph = () => {
    const [alunos, setAlunos] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você não está autenticado. Faça login novamente.");
            return;
        }

        const fetchData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };

                const response = await axios.get("http://localhost:5000/alunos/pontos/com-alunos", { headers });

                // Converte os dados para um array de objetos e ordena por horas (do maior para o menor)
                const alunosArray = Object.entries(response.data).map(([nome, horas]) => ({
                    nome,
                    horas
                })).sort((a, b) => b.horas - a.horas); // Ordenação

                setAlunos(alunosArray);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
    }, []);

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
                    }
                }
            }
        },
        scales: {
            x: { beginAtZero: true },
        },
    };

    

    

    // Altura dinâmica do gráfico
    const chartHeight = Math.max(400, labels.length * 40);

    return (
        <Grafico style={{ width: "90%", height: `${chartHeight}px`, margin: "auto" }}>
            <Bar data={data} options={options} />
        </Grafico>
    );
};

export default Graph;

import { useEffect, useState } from "react";
import axios from "axios";
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
  max-width:400px;
  border: 2px solid var(--DwYellow);

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    color: var(----DwMediumGray);
  }

  .color-box {
    width: 20px;
    height: 20px;
    border-radius: 5px;
  }
`;

const NoticeBoard = () => {
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAvisos = async () => {
            setLoading(true);
            try {
                const response = await axios.get("https://escolinha.paranoa.com.br/APIEscolinha2/alunos/avisos", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                // Pegando data atual e limite de 10 dias para frente
                const hoje = new Date();
                const limite = new Date();
                limite.setDate(hoje.getDate() + 10);

                // Filtrando avisos dentro do intervalo
                const avisosFiltrados = response.data.filter(aviso => {
                    const dataAviso = new Date(aviso.data);
                    return dataAviso >= hoje && dataAviso <= limite;
                });

                setAvisos(avisosFiltrados);
            } catch (error) {
                console.error("Erro ao buscar avisos:", error);
            }finally {
                setLoading(false);
            }
        };

        fetchAvisos();
    }, []);


    return (
        <LegendContainer className="notice-board">
            <Loading show={loading} />
            <h2>Avisos</h2>
            {avisos.length === 0 ? (
                <p>Não há avisos.</p>
            ) : (
                <ul>
                    {avisos.map((aviso) => (
                        <li key={aviso.id}>
                            <strong>
                                {aviso.data
                                    .split("-")
                                    .reverse()
                                    .join("/")}
                            </strong>
                            : {aviso.aviso}
                        </li>
                    ))}
                </ul>
            )}
        </LegendContainer>
    );
};

export default NoticeBoard;

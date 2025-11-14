import { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import styled from "styled-components";
import AddInfo from "../components/AddInfo";
import ModalInfo from "../components/ModalInfo";
import NoticeBoard from "../components/NoticeBoard";
import BirthdayBoard from "../components/BirthdayBoard";
import { FaCakeCandles } from "react-icons/fa6";

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 2rem;
  }

  .tem-aula {
    background: var(--DwYellow);
    color: white;
    border-color: white;
  }

  .sem-aula {
    background: var(--DwBoldGray);
    color: white;
    border-color: white;
  }

  .react-calendar {
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    font-family: 'Segoe UI', sans-serif;
    background-color: transparent;
    
    .react-calendar__month-view__weekdays {
      display: flex;
      justify-content: center;
      color: black;
      font-weight: 600;
      text-transform: uppercase;
      pointer-events: none;
    }
    
    .react-calendar__month-view__weekdays__weekday abbr {
      text-decoration: none !important;
    }

    .react-calendar__month-view__weekdays__weekday {
      display: flex;
      justify-content: center;
      text-align: center;
      pointer-events: none !important;
    }

    &__navigation {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-bottom: 1rem;

      button {
        color: #2c3e50;
        font-size: 1.2rem;
        min-width: 44px;
        background: none;
        border: none;
        padding: 0.8rem;
        transition: all 0.2s ease;
        font-weight: 600;
        text-transform: uppercase;
        font-style: italic;

        &:hover {
          background-color: #f0f0f0;
          border-radius: 8px;
          transform: scale(1.1);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    

    &__tile {
      position: relative;
      height: 80px;
      transition: all 0.2s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 500;
      background: #f8f9fa;
      border: 2px solid white;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background: #e9ecef;
      }

      &.tem-aula {
        background: var(--DwYellow);
        color: white;
        border-color: white;
      }

      &.sem-aula {
        background: var(--DwBoldGray);
        color: white;
        border-color: white;
      }

      &--now {
        border-color: #d31e1e !important;
      }
    }
    .react-calendar__tile.aniversario {
      color: #9b59b6;
    }
  }
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    color: #34495e;
  }

  .color-box {
    width: 20px;
    height: 20px;
    border-radius: 5px;
  }

  .hoje {
    background: white;
    border: solid red 1px;
  }
`;

const Aviso = styled.span`
  position: relative;
  font-size: 1.5rem;
  color: red;
  font-weight: bold;
  &::after{
  content: "!"; 
  }
`
const LegendAndNoticeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const ContainerSelect = styled.div`
  width: 100%;
  padding: 1rem;
  background-color: var(--DwBoldGray);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  select {
    padding: 10px 15px;
    font-size: 1rem;
    border-radius: 8px;
    border: none;
    outline: none;
    background: var(--DwYellow);
    color: #333;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }
`;



const Calendario = () => {
  const [datas, setDatas] = useState([]);
  const [role, setRole] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [aniversarios, setAniversarios] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState("");

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


  const fetchCalendario = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const role = decodedToken.role;

      const url =
        role === "aluno"
          ? `https://escolinha.paranoa.com.br/api/alunos/calendario?turmaId=${turmaSelecionada}`
          : `https://escolinha.paranoa.com.br/api/professores/calendario?turmaId=${turmaSelecionada}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const datasFormatadas = response.data.map((dia) => ({
        ...dia,
        data: new Date(dia.data).toISOString().split("T")[0],
      }));

      setDatas(datasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar calendário:", error);
    }
  }, [turmaSelecionada]);


  const fetchAniversariantes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        `https://escolinha.paranoa.com.br/api/alunos/aniversariantes?turmaId=${turmaSelecionada}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const hoje = new Date();
      const anoAtual = hoje.getFullYear();

      const datasAniversarios = response.data.map((aluno) => {
        const [ano, mes, dia] = aluno.nasc.split("T")[0].split("-");
        const dataFormatada = new Date(anoAtual, Number(mes) - 1, Number(dia));
        return dataFormatada.toISOString().split("T")[0];
      });

      setAniversarios(datasAniversarios);
    } catch (error) {
      console.error("Erro ao buscar aniversariantes:", error);
    }
  };


  useEffect(() => {
    if (!turmaSelecionada) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetchCalendario();
    fetchAniversariantes();
  }, [turmaSelecionada, fetchCalendario]);


  const handleDayClick = (date) => {
    setSelectedDay(date);
  };


  const toggleDayStatus = async () => {
    if (role !== "professor") {
      return;
    }

    if (!selectedDay) {
      console.warn("Nenhum dia selecionado para alternar o status.");
      return;
    }

    const dateString = selectedDay.toISOString().split("T")[0];
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Usuário não autenticado.");
      return;
    }

    const diaExistente = datas.find((dia) => dia.data === dateString);
    const temAula = diaExistente ? !diaExistente.temAula : true;

    try {
      if (diaExistente && diaExistente.id) {
        await axios.put(
          `https://escolinha.paranoa.com.br/api/professores/calendario/${diaExistente.id}`,
          { temAula, turma_id: turmaSelecionada },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDatas((prevDatas) =>
          prevDatas.map((dia) =>
            dia.data === dateString ? { ...dia, temAula } : dia
          )
        );
      } else {
        const response = await axios.post(
          "https://escolinha.paranoa.com.br/api/professores/calendario",
          { data: dateString, temAula, turma_id: turmaSelecionada },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDatas((prevDatas) => [
          ...prevDatas,
          { id: response.data.id, data: dateString, temAula },
        ]);
      }
      setReload((prev) => !prev);
    } catch (error) {
      console.error("Erro ao atualizar dia letivo", error);
      alert("Erro ao atualizar o dia letivo. Verifique o console para mais detalhes.");
    }
  };


  const tileClassName = ({ date }) => {
    const dateString = date.toISOString().split("T")[0];
    const dia = datas.find((d) => d.data === dateString);
    const todayString = new Date().toISOString().split("T")[0];

    let classes = "";

    if (dia) {
      classes += dia.temAula ? " tem-aula" : " sem-aula";
    } else {
      if (date.getDay() === 0 || date.getDay() === 6) {
        classes += " sem-aula";
      }
    }

    if (dateString === todayString) {
      classes += " hoje";
    }

    if (aniversarios.includes(dateString)) {
      classes += " aniversario";
    }

    return classes.trim();
  };



  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Delete") {
        handleDeleteKey(e);
      } else if (e.key === "Enter") {
        toggleDayStatus();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedDay, datas, role, toggleDayStatus]);


  const handleDeleteKey = async (e) => {
    if (role !== "professor") {
      return;
    }

    if (e.key === "Delete" && selectedDay) {
      const token = localStorage.getItem("token");
      const dateString = selectedDay.toISOString().split("T")[0];
      const diaExistente = datas.find((dia) => dia.data === dateString);

      if (!token) {
        console.error("Usuário não autenticado.");
        return;
      }

      if (diaExistente) {
        try {
          const confirmation = window.confirm(`Tem certeza que deseja excluir o registro do dia ${dateString}?`);
          if (!confirmation) {
            return;
          }

          await axios.delete(
            `https://escolinha.paranoa.com.br/api/professores/calendario/${diaExistente.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log(`Dia letivo ${dateString} excluído com sucesso.`);

          setDatas((prevDatas) =>
            prevDatas.filter((dia) => dia.id !== diaExistente.id)
          );
          setSelectedDay(null);
          setReload((prev) => !prev);
        } catch (error) {
          console.error("Erro ao excluir dia letivo", error);
          alert("Erro ao excluir o dia letivo. Verifique o console para mais detalhes.");
        }
      } else {
        console.warn("Nenhum registro encontrado para excluir no dia selecionado.");
      }
    }
  };

  const handleAvisoClick = (aviso, diaData) => {
    if (aviso && aviso.trim() !== "") {
      setModalMessage(aviso);
      setSelectedDay(new Date(diaData));
      setIsModalOpen(true);
    }
  };

  const handleSaveAviso = async (newMessage) => {
    if (role !== "professor") {
      alert("Você não tem permissão para salvar avisos.");
      setIsModalOpen(false);
      return;
    }

    if (!selectedDay) {
      console.error("Nenhum dia selecionado para salvar aviso.");
      return;
    }

    // Formata a data do selectedDay (que é um objeto Date) para o formato YYYY-MM-DD
    const formattedDate = selectedDay.toISOString().split("T")[0];
    alert(`Salvando aviso para a data: ${formattedDate}`);

    const token = localStorage.getItem("token");
    // A URL agora usa a data formatada, como o backend espera
    const url = `https://escolinha.paranoa.com.br/api/professores/calendario/${turmaSelecionada}/${formattedDate}/aviso`;

    try {
      await axios.put(
        url,
        { aviso: newMessage }, // Envia apenas o aviso no corpo da requisição
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Aviso atualizado com sucesso");

      // Atualiza o estado localmente após sucesso da API
      setDatas((prevDatas) =>
        prevDatas.map((dia) =>
          dia.data === formattedDate ? { ...dia, aviso: newMessage } : dia
        )
      );

      setIsModalOpen(false);
      setReload((prev) => !prev);
    } catch (error) {
      console.error("Erro ao atualizar aviso", error);
    }
  };

  const atualizarCalendario = () => {
    fetchCalendario();
  };

  <ModalInfo
    message={modalMessage}
    onClose={() => setIsModalOpen(false)}
    onSave={handleSaveAviso}
    isProfessor={role === "professor"}
  />


  return (
    <>
      <ContainerSelect>
        <select
          value={turmaSelecionada}
          onChange={(e) => setTurmaSelecionada(e.target.value)}
          className="border rounded-md p-2"
        >
          <option value="">Selecione uma turma</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </ContainerSelect>
      <CalendarContainer>
        <Calendar
          onClickDay={handleDayClick}
          tileClassName={tileClassName}
          locale="pt-BR"
          tileContent={({ date }) => {
            const dateString = date.toISOString().split("T")[0];
            const dia = datas.find((dia) => dia.data === dateString);
            const isAniversario = aniversarios.includes(dateString);

            return (
              <>
                {dia?.aviso && dia.aviso.trim() !== "" && (
                  <Aviso
                    onClick={() => handleAvisoClick(dia.aviso, dia.data)}
                    style={{
                      bottom: "4px",
                      marginLeft: "5px",
                      transform: "translateX(-50%)",
                      zIndex: 10
                    }}
                  />
                )}

                {isAniversario && (
                  <FaCakeCandles
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "6px",
                      color: "#9b59b6",
                      fontSize: "1rem",
                      zIndex: 10
                    }}
                    title="Aniversariante"
                  />
                )}
              </>
            );
          }}
        />

        <LegendAndNoticeContainer>
          <NoticeBoard turmaSelecionada={turmaSelecionada} onAvisoAdicionado={reload} />
          <BirthdayBoard turmaId={turmaSelecionada} />
          <LegendContainer>
            <div className="legend-item"><div className="color-box tem-aula" /> Aula</div>
            <div className="legend-item"><div className="color-box sem-aula" /> Sem aula</div>
            <div className="legend-item"><div className="color-box hoje" />Hoje</div>
          </LegendContainer>
        </LegendAndNoticeContainer>

        {role == "professor" ? <AddInfo turmaSelecionada={turmaSelecionada} onAvisoAdicionado={atualizarCalendario} /> : ""}

        {isModalOpen && <ModalInfo message={modalMessage} onClose={() => setIsModalOpen(false)} isProfessor={role === "professor"} onSave={handleSaveAviso} />}
      </CalendarContainer>
    </>
  );
};

export default Calendario;

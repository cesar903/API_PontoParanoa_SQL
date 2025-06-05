import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import styled from "styled-components";
import AddInfo from "../components/AddInfo";
import ModalInfo from "../components/ModalInfo";
import NoticeBoard from "../components/NoticeBoard";
import BirthdayBoard from "../components/BirthdayBoard";

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

  .tem-aula {
    background: var(--DwYellow);
  }

  .sem-aula {
    background: var(--DwBoldGray);
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
const Calendario = () => {
  const [datas, setDatas] = useState([]);
  const [role, setRole] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [clicks, setClicks] = useState(0);

  let clickTimeout = null;


  useEffect(() => {
    const fetchCalendario = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado.");
        return;
      }

      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setRole(decodedToken.role);

        const url = decodedToken.role === "aluno"
          ? "http://localhost:5000/alunos/calendario"
          : "http://localhost:5000/professores/calendario";

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const datasFormatadas = response.data.map((dia) => ({
          ...dia,
          data: new Date(dia.data).toISOString().split("T")[0],
        }));
        setReload(!reload);
        setDatas(datasFormatadas);
      } catch (error) {
        console.error("Erro ao buscar calendário", error);
      }
    };

    fetchCalendario();
  }, [reload]);

  const handleDayClick = (date) => {
    setSelectedDay(date);
    setClicks(prev => prev + 1);
    if (clickTimeout) clearTimeout(clickTimeout);

    clickTimeout = setTimeout(() => {
      if (clicks === 1) {
        handleDoubleClick(date);
      }
      setClicks(0);
    }, 250); 
  };
  

  const handleDoubleClick = async (date) => {
    if (role == "professor") {
      if (date.getDay() === 0 || date.getDay() === 6) {
        alert("Não é permitido adicionar aula em sábados e domingos.");
        return;
      }
    }
  
    const dateString = date.toISOString().split("T")[0];
    console.log("Data selecionada:", dateString);
    
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("Usuário não autenticado.");
      return;
    }
  
    const diaExistente = datas.find((dia) => dia.data === dateString);
    const temAula = diaExistente ? !diaExistente.temAula : true;
  
    try {
      if (role === "professor") {
        if (diaExistente && diaExistente.id) {
          await axios.put(
            `http://localhost:5000/professores/calendario/${diaExistente.id}`,
            { temAula },
            { headers: { Authorization: `Bearer ${token}` } }
          );
  
          setDatas((prevDatas) =>
            prevDatas.map((dia) =>
              dia.data === dateString ? { ...dia, temAula } : dia
            )
          );
        } else {
          const response = await axios.post(
            "http://localhost:5000/professores/calendario",
            { data: dateString, temAula },
            { headers: { Authorization: `Bearer ${token}` } }
          );
  
          setDatas((prevDatas) => [
            ...prevDatas,
            { id: response.data.id, data: dateString, temAula },
          ]);
        }
        setReload((prev) => !prev);
      }
    } catch (error) {
      console.error("Erro ao atualizar dia letivo", error);
    }
  };


  const tileClassName = ({ date }) => {
    const dateString = date.toISOString().split("T")[0];
    const dia = datas.find((dia) => dia.data === dateString);

    let classes = "";

    if (date.getDay() === 0 || date.getDay() === 6) {
      classes += "sem-aula"; 
    }

    if (dia) {
      classes += dia.temAula ? " tem-aula" : " sem-aula";
      if (dia.aviso && dia.aviso.trim() !== "") {
        classes += " aviso"; 
      }
    }

    if (dateString === new Date().toISOString().split("T")[0]) {
      classes += " hoje";
    }

    return classes.trim();
  };



  useEffect(() => {
    window.addEventListener("keydown", handleDeleteKey);
    return () => {
      window.removeEventListener("keydown", handleDeleteKey);
    };
  }, [selectedDay]);

  const handleDeleteKey = async (e) => {
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
          const response = await axios.delete(
            `http://localhost:5000/professores/calendario/${diaExistente.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log(response.data.msg);

          setDatas((prevDatas) =>
            prevDatas.filter((dia) => dia.id !== diaExistente.id)
          );
        } catch (error) {
          console.error("Erro ao excluir dia letivo", error);
        }
      } else {
        console.error("Dia não encontrado para exclusão");
      }
      setReload((prev) => !prev);
    }
  };

  const handleAvisoClick = (aviso, diaId) => {
    if (aviso && aviso.trim() !== "") {
      setModalMessage(aviso);
      setSelectedDay(diaId); 
      setIsModalOpen(true);
    }
  };

  const handleSaveAviso = (newMessage) => {
    if (!selectedDay) return;

    // Formata a data para o formato AAAA-MM-DD
    const formattedDate = new Date(selectedDay).toISOString().split("T")[0];
    const updatedDatas = datas.map((dia) =>
      dia.id === selectedDay ? { ...dia, aviso: newMessage } : dia
    );
    setDatas(updatedDatas);

    const token = localStorage.getItem("token");
    const url = `http://localhost:5000/professores/calendario/${formattedDate}/aviso`;

    axios
      .put(
        url,
        { aviso: newMessage, data: formattedDate }, // Adiciona a data formatada no payload
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        console.log("Aviso atualizado com sucesso");
      })
      .catch((error) => {
        console.error("Erro ao atualizar aviso", error);
      });
    setReload((prev) => !prev);
  };

  <ModalInfo
    message={modalMessage}
    onClose={() => setIsModalOpen(false)}
    onSave={handleSaveAviso}
    isProfessor={role === "professor"}
  />


  return (
    <CalendarContainer>
      <Calendar
        onClickDay={handleDayClick}
        tileClassName={tileClassName}
        locale="pt-BR"
        tileContent={({ date }) => {
          const dateString = date.toISOString().split("T")[0];
          const dia = datas.find((dia) => dia.data === dateString);

          return (
            dia?.aviso && dia.aviso.trim() !== "" && (
              <Aviso
                className="aviso"
                onClick={() => handleAvisoClick(dia.aviso, dia.data)}
              >

              </Aviso>
            )
          );
        }}
      />
      <LegendAndNoticeContainer>

        <NoticeBoard />
        <BirthdayBoard />
        <LegendContainer>
          <div className="legend-item"><div className="color-box tem-aula" /> Aula</div>
          <div className="legend-item"><div className="color-box sem-aula" /> Sem aula</div>
          <div className="legend-item"><div className="color-box hoje" />Hoje</div>
        </LegendContainer>
      </LegendAndNoticeContainer>

      {role == "professor" ? <AddInfo /> : ""}

      {isModalOpen && <ModalInfo message={modalMessage} onClose={() => setIsModalOpen(false)} isProfessor={role === "professor"} onSave={handleSaveAviso} />}
    </CalendarContainer>
  );
};

export default Calendario;

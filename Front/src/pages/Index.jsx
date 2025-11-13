import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle, FaUserPlus, FaRegComments } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";
import User from "../components/User";
import Verification from "./Verification";
import StudantList from "../components/StudantList";
import MessageModal from "../components/MessageModal";


const Title = styled.span`
    text-align: center;
    width: 100%;
    font-size: 1em;

    @media (max-width: 768px) {
        font-size: 1em;
    }
`;


const Header = styled.div`
    background-color: var(--DwBoldGray);
    color: white;
    padding: 15px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.5em;
    font-weight: bold;

    @media (max-width: 768px) {
        font-size: 1em;
        padding: 10px;
    }
`;


const UserContainer = styled.div`
    display: flex;
    gap: 15px;
`;


const UserIcon = styled(FaUserCircle)`
    font-size: 32px;
    color: var(--DwYellow);

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;


const LogoutButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 32px;
    cursor: pointer;
    transition: 0.3s;
    margin-top: -10px;

    &:hover {
        color: var(--DwYellow);
    }

`;

const NavBar = styled.div`
    display: flex;
    background-color: var(--DwYellow);
    padding: 10px;
    flex-wrap: wrap;
`;

const NavButton = styled(Link)`
    flex: 1;
    padding: 12px;
    background-color: ${({ $active }) => ($active ? "var(--DwBoldGray)" : "var(--DwYellow)")};
    color: ${({ $active }) => ($active ? "var(--DwYellow)" : "var(--DwBoldGray)")};
    text-decoration: none;
    font-size: 1.2em;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
    text-align: center;

    &:hover {
        background-color: var(--DwBoldGray);
        color: var(--DwYellow);
        text-decoration: none;
    }

    @media (max-width: 768px) {
        font-size: 0.7em;
        padding: 10px;
    }
`;

const ReportButton = styled(Link)`
    background: none;
    border: none;
    color: var(--DwYellow);
    font-size: 1.3em;
    cursor: pointer;
    transition: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
        font-size: 1.2em;
    }

    &:hover{
        color: var(--DwYellow);;
    }
`;


function Index() {
    const location = useLocation();
    const [role, setRole] = useState(null);
    const [nome, setNome] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [showMessagesModal, setShowMessagesModal] = useState(false);
    const [naoLidasTotal, setNaoLidasTotal] = useState(0);

    // useEffect(() => {
    //     const token = localStorage.getItem("token");
    //     if (!token) return;

    //     const buscarNaoLidas = async () => {
    //         try {
    //             const res = await axios.get(
    //                 "https://escolinha.paranoa.com.br/api/mensagens/nao-lidas",
    //                 { headers: { Authorization: `Bearer ${token}` } }
    //             );
    //             // res.data.contador é um objeto com {usuarioId: qtd}
    //             const total = Object.values(res.data.contador || {}).reduce((acc, v) => acc + v, 0);
    //             setNaoLidasTotal(total);
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     };

    //     buscarNaoLidas();
    //     const interval = setInterval(buscarNaoLidas, 3000);
    //     return () => clearInterval(interval);
    // }, []);


    const toggleModal = async () => {
        if (!isModalOpen) {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("https://escolinha.paranoa.com.br/api/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserData(response.data);
            } catch (error) {
                console.error("Erro ao buscar dados do usuário:", error);
            }
        }
        setIsModalOpen(!isModalOpen);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setRole(decoded.role);
                setNome(decoded.nome);
            } catch (error) {
                console.error("Erro ao decodificar token:", error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    return (
        <>
            <Header>
                <Title>{nome ? `${nome.toUpperCase()} - ${role.toUpperCase()}` : "Carregando..."}</Title>
                <UserContainer>
                    <div onClick={toggleModal} style={{ cursor: "pointer" }}>
                        <UserIcon />
                    </div>

                    <div onClick={() => setShowMessagesModal(true)} style={{ cursor: "pointer" }}>
                        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowMessagesModal(true)}>
                            <FaRegComments size={28} color="var(--DwYellow)" />
                             {naoLidasTotal > 0 && (
                            <span style={{
                                position: "absolute",
                                top: 5,
                                right: -5,
                                background: "red",
                                color: "#fff",
                                borderRadius: "50%",
                                padding: "2px 6px",
                                fontSize: "10px",
                                fontWeight: "bold"
                            }}>
                                {naoLidasTotal}
                            </span>
                             )}
                        </div>

                    </div>

                    {role == "professor" ?
                        <>
                            <ReportButton to="/index/register" $active={location.pathname === "/index/register"}>
                                <FaUserPlus />
                            </ReportButton></>
                        :
                        <></>}

                    <LogoutButton onClick={handleLogout}>
                        <FiLogOut />
                    </LogoutButton>

                </UserContainer>
            </Header>
            {isModalOpen && userData && <User user={userData} onClose={toggleModal} />}

            <NavBar>
                {role === "professor" ?
                    <NavButton to="/index/report" $active={location.pathname === "/index/report"}>
                        Classe
                    </NavButton>
                    :
                    <NavButton to="/index/points" $active={location.pathname === "/index/points"}>
                        Check-In/Out
                    </NavButton>
                }
                <NavButton to="/index/verification" $active={location.pathname === "/index/verification"}>
                    Verificações
                </NavButton>
                <NavButton to="/index/calendar" $active={location.pathname === "/index/calendar"}>
                    Calendário
                </NavButton>
            </NavBar>

            <div className="content">
                {location.pathname === "/index/verification" ? (
                    role === "aluno" ? <Verification /> : <StudantList />
                ) : (
                    <Outlet />
                )}
            </div>

            {showMessagesModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowMessagesModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "10px",
                            width: "90%",
                            maxWidth: "400px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3>Enviar mensagem</h3>
                        <MessageModal onClose={() => setShowMessagesModal(false)} />
                    </div>
                </div>
            )}

        </>
    );
}

export default Index;

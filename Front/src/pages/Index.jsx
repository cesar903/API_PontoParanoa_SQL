import { Link, Outlet, useLocation } from "react-router-dom"; 
import { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle, FaUserPlus } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";
import User from "../components/User";
import Verification from "./Verification";
import StudantList from "../components/StudantList";


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
        </>
    );
}

export default Index;

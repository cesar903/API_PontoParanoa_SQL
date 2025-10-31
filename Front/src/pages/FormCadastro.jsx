import { Link } from "react-router-dom";
import styled from "styled-components";
import LogoParanoa from "../assets/logo-paranoa.png";
import LogoDataWake from "../assets/logoDatawake.png";

export const Container = styled.div`
  min-height: 100vh;
  background-color: #4b4b4b;
  color: #4b4b4b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

export const Logos = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;

  .logo-paranoa {
    height: 80px;
  }

  .logo-datawake {
    height: 55px;
  }

  @media (max-width: 600px) {
    .logo-paranoa {
      height: 60px;
    }
    .logo-datawake {
      height: 45px;
    }
  }
`;

export const Title = styled.h1`
  font-size: 1.6rem;
  color: #00aded;
  font-weight: 700;
  margin-bottom: 0.3rem;
`;

export const Subtitle = styled.p`
  font-size: 0.9rem;
  color: #b6b5b5;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

export const StyledLink = styled(Link)`
  display: block;
  text-align: center;
  background-color: ${({ color }) => color || "#00aded"};
  color: ${({ text }) => text || "white"};
  border: ${({ border }) => (border ? `2px solid ${border}` : "none")};
  padding: 0.9rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;

  &:hover {
    background-color: ${({ border, color }) =>
        border ? border : color === "#4B4B4B" ? "#333" : "#0095c7"};
    color: white;
    transform: translateY(-2px);
  }
`;

export const Footer = styled.footer`
  margin-top: 2.5rem;
  font-size: 0.75rem;
  color: #999;
  text-align: center;
`;


export default function FormCadastro() {
    return (
        <Container>
            <Header>
                <Logos>
                    <div className="container">
                        <img src={LogoParanoa} alt="Logo Paranoá" className="logo-paranoa img-fluid mr-4 mb-4"/>
                        <img src={LogoDataWake} alt="Logo Datawake" className="logo-datawake img-fluid mb-4" />
                    </div>
                    
                    
                </Logos>

                <Title>Inscrições para nossos processos.</Title>
                <Subtitle>
                    Escolha abaixo o formulário para realizar a inscrição desejada.
                </Subtitle>
            </Header>

            <ButtonsContainer>
                <StyledLink to="/cadastroginastica" color="#00aded">
                    Inscrição Ginástica
                </StyledLink>

                <StyledLink to="/cadastroescola" color="#00aded">
                    Inscrição Escola Digital
                </StyledLink>

                <StyledLink to="/cadastrokarate" color="#00aded" >
                    Inscrição Karatê
                </StyledLink>
            </ButtonsContainer>

        </Container>
    );
}

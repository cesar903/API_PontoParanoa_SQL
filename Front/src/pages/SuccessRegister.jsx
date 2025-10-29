import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa';

import LogoParanoa from "../assets/logo-paranoa.png";
import LogoDataWake from "../assets/logoDataWake.png";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pop = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`;

const Container = styled.div`
  background-color: #4B4B4B;
`;

const SuccessPageWrapper = styled.div`
  font-family: 'Roboto', sans-serif;
  background-color: #4B4B4B;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  margin: 0;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const SuccessContainer = styled.div`
  background-color: #ffffff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  animation: ${fadeIn} 0.8s ease-out;
  z-index: 5;
  position: relative;

  @media (max-width: 480px) {
    padding: 30px 20px;
  }
`;

const SuccessIcon = styled(FaCheckCircle)`
  color: #28a745;
  font-size: 60px;
  margin-bottom: 20px;
  animation: ${pop} 0.5s ease-out;

  @media (max-width: 480px) {
    font-size: 50px;
  }
`;

const Title = styled.h1`
  color: #333;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Paragraph = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Logo = styled.img`
  width: 200px;
  max-width: 80%;
  height: auto;
  animation: ${fadeIn} 1s ease-out;

  @media (max-width: 768px) {
    width: 150px;
  }

  @media (max-width: 480px) {
    width: 120px;
    margin-bottom: 10px;
  }
`;


const LearnMoreButton = styled.a`
  display: inline-block;
  background-color: #4B4B4B;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  animation: ${fadeIn} 1s ease-out;
  border: none;

  &:hover {
    background-color: #333;
    transform: translateY(-3px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    color: white;
    text-decoration: none;
  }

  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

export default function SuccessRegister() {
  return (
    <Container>
      <div className="container-fluid py-3 text-center">
        <div className="row align-items-center justify-content-between">
          <div className="col-6 text-start">
            <Logo src={LogoParanoa} alt="Logo Paranoá" />
          </div>
          <div className="col-6 text-end">
            <Logo src={LogoDataWake} alt="Logo DataWake" />
          </div>
        </div>
      </div>

      <SuccessPageWrapper>
        <SuccessContainer>
          <SuccessIcon />
          <Title>Cadastro Realizado com Sucesso!</Title>
          <Paragraph>
            Seu cadastro foi concluído com êxito. Entraremos em contato assim que possível.
          </Paragraph>

          
          <LearnMoreButton
            href="https://www.paranoa.com.br/"
            target="_blank"
          >
            Conheça mais!
          </LearnMoreButton>
        </SuccessContainer>
      </SuccessPageWrapper>
    </Container>
  );
}

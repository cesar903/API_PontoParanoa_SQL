import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7); /* Fundo escuro semi-transparente */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 6px solid #fff;
  border-top: 6px solid var(--DwYellow); 
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function Loading({ show }) {
  if (!show) return null; // Se não estiver carregando, não exibe nada

  return (
    <Overlay>
      <Spinner />
    </Overlay>
  );
}

export default Loading;

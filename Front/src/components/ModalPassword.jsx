import styled from "styled-components";
import { useState } from "react";
import axios from "axios"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loading from "./Loading";

const ModalContainer = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    z-index: 1000;
    width: 300px;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
`;

const CloseButton = styled.button`
    background: red;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    margin: 10px;
`;

const SaveButton = styled.button`
    background: var(--DwBoldGray);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    margin: 10px;
    text-align: center;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
`;

const InputContainer = styled.div`
    position: relative;
    width: 100%;
`;

const Input = styled.input`
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const EyeIcon = styled.div`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
`;

const ModalPassword = ({ onClose, userId }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }
        setLoading(true);
        try {
            await axios.put(
                `https://escolinha.paranoa.com.br/api/me/password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            alert("Senha alterada com sucesso!");
            onClose();
        } catch (error) {
            console.log(error);
            if (error.response && error.response.data.msg === "A senha atual está incorreta. Tente novamente.") {
                setError("A senha atual está incorreta. Tente novamente.");
            } else {
                setError("Erro ao alterar a senha. Tente novamente.");
            }
        }finally {
            setLoading(false); 
        }
    };

    return (
        <>
            <Overlay onClick={onClose} />
            <Loading show={loading} /> 
            <ModalContainer>
                <h2>Alterar Senha</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <InputContainer>
                        <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Senha Atual"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                        <EyeIcon onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </EyeIcon>
                    </InputContainer>
                    <InputContainer>
                        <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Nova Senha"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <EyeIcon onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </EyeIcon>
                    </InputContainer>
                    <InputContainer>
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar Nova Senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <EyeIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </EyeIcon>
                    </InputContainer>
                    <ButtonContainer>
                        <SaveButton type="submit">Salvar</SaveButton>
                        <CloseButton onClick={onClose}>Fechar</CloseButton>
                    </ButtonContainer>
                </form>
            </ModalContainer>
        </>
    );
};

export default ModalPassword;

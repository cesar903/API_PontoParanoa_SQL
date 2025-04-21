import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(to bottom, #08090a, #1c2224);
`;

const LoginBox = styled.div`
    background: rgba(255, 255, 255, 0.055);
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    width: 300px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    border: solid var(--DwYellow) 2px;
`;

const InputContainer = styled.div`
    position: relative;
    width: 100%;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    padding-right: 40px;
    margin: 10px 0;
    border: none;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-size: 16px;
    outline: none;
    &::placeholder {
        color: rgba(255, 255, 255, 0.7);
    }
`;

const IconButton = styled.button`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 18px;
`;

const Button = styled.button`
    width: 100%;
    padding: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: 0.3s;
    &:hover {
        background: var(--DwYellow);
    }
`;

const ErrorMessage = styled.p`
    font-size: 14px;
    margin-top: 10px;
    color: red;
`;

const SuccessMessage = styled.p`
    font-size: 14px;
    margin-top: 10px;
    color: green;
`;

const Titulo = styled.h2`
    color: white;
    font-size: 1rem;
`;

function UpdatePassword() {
    const { token } = useParams();
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const handleResetPassword = async () => {
        setError('');
        setSuccess('');

        if (novaSenha !== confirmarSenha) {
            setError('As senhas não coincidem');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/auth/resetar-senha/${token}`, { novaSenha });
            setSuccess(response.data.msg);
            await delay(3000);
            navigate("/");
        } catch (error) {
            setError(error.response?.data?.msg || 'Erro ao redefinir senha');
        }
    };

    return (
        <LoginContainer>
            <LoginBox>
                <Titulo>Redefinir Senha</Titulo>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}
                
                <InputContainer>
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nova senha"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                    />
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                </InputContainer>

                <InputContainer>
                    <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme a nova senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                </InputContainer>

                <Button onClick={handleResetPassword}>Redefinir Senha</Button>
            </LoginBox>
        </LoginContainer>
    );
}

export default UpdatePassword;

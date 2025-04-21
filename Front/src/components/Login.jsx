import { useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GiRabbitHead  } from "react-icons/gi";
import Fundo from '../assets/fundo.jpg';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Loading from './Loading';

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-image: url(${Fundo}); 
    background-size: cover; 
    background-position: center; 
    background-repeat: no-repeat;
`;

const LoginBox = styled.div`
    background: rgba(0, 0, 0, 0.906);
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    width: 300px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    border: solid var(--DwYellow) 2px;
`;

const Icon = styled.div`
    margin-bottom: 10px;
    margin-top: -80px;
    color: white;
    font-size: 40px;
    border: solid var(--DwYellow) 2px;
    background-color: #08090a;
    border-radius: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
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

const PasswordContainer = styled.div`
    position: relative;
    width: 100%;
`;

const Centralized = styled.div`
    display: flex;
    justify-content: center;
`
    ;

const EyeIcon = styled.div`
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
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
        background: rgba(255, 255, 255, 0.3);
    }
`;

const ErrorMessage = styled.p`
    color: red;
    font-size: 14px;
    margin-top: 10px;
`;

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError(''); 

        try {
            console.log('Tentando fazer login com:', email, password); // Logando os dados de login
            const response = await axios.post('http://localhost:5000/auth/login', {
                email: email,
                senha: password,
            });

            localStorage.setItem('token', response.data.token);
            navigate("/index/calendar");
        } catch (error) {
            setError(error.response?.data?.msg || 'Erro ao fazer login');
        } finally {
            setLoading(false); 
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <LoginContainer>
            <Loading show={loading} />
            <LoginBox>
                <form onSubmit={handleSubmit}>
                    <Centralized>
                        <Icon>
                            <GiRabbitHead />
                        </Icon>
                    </Centralized>
                    <Input
                        type="email"
                        placeholder="Email ID"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <PasswordContainer>
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <EyeIcon onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </EyeIcon>
                    </PasswordContainer>
                    <Link to="/recover" style={{ color: "white", textDecoration: "none", margin: "10px 0", display: "block" }}>
                        Esqueceu a senha?
                    </Link>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <Button type="submit">LOGIN</Button>
                </form>
            </LoginBox>

        </LoginContainer>
    );
}

export default Login;

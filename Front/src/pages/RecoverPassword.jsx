import { useState } from 'react';
import axios from 'axios'; // Importe o Axios
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';

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

const Message = styled.p`
    font-size: 14px;
    margin-top: 10px;
    color: ${(props) => (props.success ? 'green' : 'red')};
`;

const Titulo = styled.h2`
    color: white;
    font-size: 1rem;
`

const Options = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: white;
    margin: 10px 0;
    a {
        color: white;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
`;

function RecoverPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sucess, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('https://escolinha.paranoa.com.br/APIEscolinha2/auth/recuperar-senha', { email });

            if (response.status === 200) {
                setSuccess(true);
                setMessage('E-mail de recuperação enviado com sucesso!');
            } else {
                setSuccess(false);
                setMessage(response.data.msg || 'Erro ao enviar a recuperação de senha');
            }
        } catch (error) {
            setSuccess(false);
            setMessage('Erro ao tentar recuperar a senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginContainer>
            <Loading show={loading} />
            <LoginBox>
                <Titulo>Recuperar Senha</Titulo>
                <form onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder='Digite seu email...'
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Enviando...' : 'Recuperar Senha'}
                    </Button>
                    <Options>
                        <Link to="/">Realizar Login</Link>
                    </Options>
                </form>
                {message && <Message success={sucess}>{message}</Message>}
            </LoginBox>
        </LoginContainer>
    );
}

export default RecoverPassword;


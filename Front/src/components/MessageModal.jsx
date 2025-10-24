import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";


const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContainer = styled.div`
  background: #fff;
  width: 90%;
  max-width: 900px;
  height: 80vh;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
`;

const Sidebar = styled.div`
  width: 30%;
  background: #f4f4f4;
  border-right: 1px solid #ccc;
  padding: 10px;
  overflow-y: auto;
`;

const UserList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "var(--DwBoldGray)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--DwYellow)" : "black")};
  transition: 0.3s;

  &:hover {
    background: var(--DwBoldGray);
    color: var(--DwYellow);
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fafafa;
`;

const ChatHeader = styled.div`
  padding: 10px;
  background: #eee;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Message = styled.div`
  max-width: 70%;
  align-self: ${({ $sent }) => ($sent ? "flex-end" : "flex-start")};
  background: ${({ $sent }) => ($sent ? "var(--DwYellow)" : "#e0e0e0")};
  color: ${({ $sent }) => ($sent ? "var(--DwBoldGray)" : "#000")};
  padding: 8px 12px;
  border-radius: 10px;
  word-wrap: break-word;
`;

const ChatInput = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
  gap: 10px;
`;

const TextArea = styled.textarea`
  flex: 1;
  resize: none;
  height: 60px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const SendButton = styled.button`
  background: var(--DwBoldGray);
  color: var(--DwYellow);
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: var(--DwYellow);
    color: var(--DwBoldGray);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 40px;
  background: #ff4b4b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;

  &:hover {
    background: #e63e3e;
  }
`;

const NoChat = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;


export default function MessageModal({ onClose }) {
    const [usuarios, setUsuarios] = useState([]);
    const [mensagens, setMensagens] = useState([]);
    const [destinatarioId, setDestinatarioId] = useState(null);
    const [conteudo, setConteudo] = useState("");
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const token = localStorage.getItem("token");
    const [naoLidas, setNaoLidas] = useState({});
    const chatMessagesRef = useRef(null);

    const scrollToBottom = () => {
        const container = chatMessagesRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };


    // Buscar lista de usuários (alunos)
    useEffect(() => {
        async function carregarUsuarios() {
            try {
                const res = await axios.get("http://localhost:5000/api/contatos", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsuarios(res.data);

                setUsuarios(res.data);
            } catch (error) {
                console.error("Erro ao carregar usuários:", error);
            }
        }
        carregarUsuarios();
    }, [token]);


    useEffect(() => {
        if (!destinatarioId) return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/mensagens/${destinatarioId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMensagens(res.data);
            } catch (err) {
                console.error("Erro ao atualizar mensagens:", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [destinatarioId, token]);

    // Enviar nova mensagem
    async function enviarMensagem() {
        if (!destinatarioId || !conteudo.trim()) return;
        try {
            const res = await axios.post(
                "http://localhost:5000/api/mensagens",
                { destinatarioId, conteudo },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMensagens((prev) => [...prev, res.data]);
            setConteudo("");
            setTimeout(scrollToBottom, 200)
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            alert("Erro ao enviar mensagem");
        }
    }

    useEffect(() => {
        if (!token) {
            console.warn("Nenhum token encontrado — usuário não autenticado.");
            return;
        }

        const buscarNaoLidas = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/mensagens/nao-lidas",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setNaoLidas(res.data.contador || {});
            } catch (err) {
                console.error("Erro ao buscar mensagens não lidas:", err.response?.data || err);
            }
        };

        buscarNaoLidas();

        const interval = setInterval(buscarNaoLidas, 3000);

        return () => clearInterval(interval);
    }, [token]);





    async function abrirConversa(id) {
        setDestinatarioId(id);

        try {
            const res = await axios.put(
                `http://localhost:5000/api/mensagens/marcar-como-lidas/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNaoLidas((prev) => {
                const novo = { ...prev };
                delete novo[id];
                return novo;
            });

            // Espera as mensagens serem carregadas antes de rolar
            const msgsRes = await axios.get(
                `http://localhost:5000/api/mensagens/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMensagens(msgsRes.data);

            // Rola para baixo apenas **uma vez**
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error(error);
        }
    }




    // Marca automaticamente como lidas enquanto a conversa está aberta
    useEffect(() => {
        if (!destinatarioId || !token) return;

        const marcarLidas = async () => {
            try {
                await axios.put(
                    `http://localhost:5000/api/mensagens/marcar-como-lidas/${destinatarioId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error("Erro ao marcar mensagens como lidas automaticamente:", error);
            }
        };

        // Marca imediatamente
        marcarLidas();

        // E continua marcando a cada 5 segundos enquanto o chat está aberto
        const interval = setInterval(marcarLidas, 1000);

        return () => clearInterval(interval);
    }, [destinatarioId, token]);




    return (
        <Overlay>
            <ModalContainer>
                {/* Sidebar de contatos */}
                <Sidebar>
                    <h3>Contatos</h3>
                    {usuarios.length === 0 ? (
                        <p>Nenhum contato disponível</p>
                    ) : (
                        <UserList>
                            {usuarios.map((u) => (
                                <UserItem
                                    key={u.id}
                                    $active={destinatarioId === u.id}
                                    onClick={() => abrirConversa(u.id)}
                                >
                                    {u.nome}
                                    {naoLidas && naoLidas[u.id] > 0 && (
                                        <span style={{
                                            marginLeft: "5px",
                                            background: "var(--DwYellow)",
                                            color: "white",
                                            borderRadius: "50%",
                                            padding: "2px 5px",
                                            fontSize: "9px"
                                        }}>
                                            {naoLidas[u.id]}
                                        </span>
                                    )}

                                </UserItem>

                            ))}
                        </UserList>
                    )}
                </Sidebar>

                {/* Área do chat */}
                <ChatArea>
                    {destinatarioId ? (
                        <>
                            <ChatHeader>
                                <strong>
                                    Conversando com:{" "}
                                    {usuarios.find((u) => u.id === destinatarioId)?.nome}
                                </strong>
                            </ChatHeader>
                            <ChatMessages ref={chatMessagesRef}>
                                {loadingMsgs ? (
                                    <p>Carregando mensagens...</p>
                                ) : mensagens.length > 0 ? (
                                    mensagens.map((m) => (
                                        <Message key={m.id} $sent={m.remetenteId !== destinatarioId}>
                                            {m.conteudo}
                                        </Message>
                                    ))
                                ) : (
                                    <p>Nenhuma mensagem ainda.</p>
                                )}
                            </ChatMessages>


                            <ChatInput>
                                <TextArea
                                    value={conteudo}
                                    onChange={(e) => setConteudo(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                />
                                <SendButton onClick={enviarMensagem}>Enviar</SendButton>
                            </ChatInput>
                        </>
                    ) : (
                        <NoChat>
                            <p>Selecione um contato para iniciar a conversa.</p>
                        </NoChat>
                    )}
                </ChatArea>
            </ModalContainer>

            <CloseButton onClick={onClose}>Fechar</CloseButton>
        </Overlay>
    );
}


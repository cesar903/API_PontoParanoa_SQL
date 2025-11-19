import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Paranoa from "../assets/logo-paranoa.png"
import Datawake from "../assets/logoDatawake.png"
import { AiOutlineExclamationCircle } from "react-icons/ai";
import SignatureCanvas from "react-signature-canvas";
import PDFRegister from "../components/PDFRegisterKarate";
import { ToastContainer, toast } from 'react-toastify';


const Container = styled.div`
    background-color: #3e3e3f;
    color: white;
    font-weight: 600;
    min-height: 100vh;

    .alertError {
        color: red;
        position: absolute;
        right: 10px;
        top: 73%;
        transform: translateY(-50%);
        pointer-events: none;
    }


    img{
        width: 200px;
    }

    .is-invalid {
        border: 2px solid red !important;
        border-radius: 4px;
    }


`
const ButtonBar = styled.div`
  display: flex;
  flex-wrap: wrap;         
  background-color: #222;
  width: 100%;
  border-radius: 8px; 
  padding: 10px;
  justify-content: center; 
`;



const NavButton = styled.button`
  flex: 1;
  padding: 5px 5px;
  background-color: ${({ $active }) => ($active ? "#fff" : "transparent")};
  color: ${({ $active }) => ($active ? "#000" : "#aaa")};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 5px;

  &:hover {
    color: #fff;
    background-color: ${({ $active }) => ($active ? "#fff" : "#333")};
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;


const Perfil = styled.img`
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
`
const AddImage = styled.button`
    background-color: #fbb514;
    color: black;
`



export default function KarateRegister() {
    const [form, setForm] = useState({

        nome: "",
        nascimento: "",
        email: "",
        rg: "",
        cpf: "",
        telefone: "",
        foto: null,
        camisa: "",
        chinelo: "",
        kimono: "",
        modalidade: "",
        modalidadeAnterior: "",
        funcionarioIndicando: "",
        telefoneFuncionario: "",
        parentesco: "",
        tratamentoSaude: "",
        tratamentoSaudeDetalhe: "",
        transtorno: "",
        transtornoDetalhe: "",
        cid: "",
        laudo: "",
        acompanhamento: "",
        medicamento: "",

        endereco: {
            cep: "",
            rua: "",
            numero: "",
            bairro: "",
            cidade: "",
            complemento: "",
            linhasOnibus: "",
            valorVT: ""
        },

        pai: {
            nome: "",
            telefone: "",
            rg: "",
            cpf: "",
            desempregado: "",
            profissao: "",
            email: ""
        },
        mae: {
            nome: "",
            telefone: "",
            rg: "",
            cpf: "",
            desempregada: "",
            profissao: "",
            email: ""
        },
        termo: "",
        dataDeclaracao: new Date().toISOString().split("T")[0]
    });

    const [mostrar, setMostrar] = useState({
        tratamentoSaude: false,
        transtorno: false,
        medicamento: false,
        modalidade: false
    });

    const [etapa, setEtapa] = useState(1);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [erros, setErros] = useState({});
    const sigCanvasAluno = useRef(null);
    const navigate = useNavigate();

    //Evita o envio do form com o enter no navegador e no servidor
    useEffect(() => {
        const formElement = document.querySelector("#formulario");
        if (!formElement) return;

        const handleKeyDown = (e) => {
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
            }
        };

        formElement.addEventListener("keydown", handleKeyDown);
        return () => formElement.removeEventListener("keydown", handleKeyDown);
    }, []);



    const proximaEtapa = () => {
        if (validarEtapa()) setEtapa((prev) => prev + 1);
    };
    const etapaAnterior = () => setEtapa((prev) => prev - 1);

    const getValue = (obj, path) => {
        return path.split('.').reduce((acc, key) => acc && acc[key], obj);
    };


    const validarEtapa = () => {
        const camposObrigatorios = {
            1: ["nome", "nascimento", "email", "rg", "cpf", "foto", "telefone", "modalidade", "funcionarioIndicando", "parentesco", "kimono", "chinelo", "camisa", "telefoneFuncionario"],
            2: ["transtorno", "tratamentoSaude", "medicamento"],
            3: ["endereco.cep", "endereco.rua", "endereco.numero", "endereco.bairro", "endereco.cidade", "endereco.linhasOnibus", "endereco.valorVT"],
            4: ["mae.nome", "mae.rg", "mae.cpf", "mae.telefone", "pai.nome", "pai.rg", "pai.cpf", "pai.telefone"],
            5: ["dataDeclaracao", "assinaturaAluno", "termo"]
        };

        if (mostrar.modalidade) {
            camposObrigatorios[1].push("modalidadeDetalhe");
        }

        const novosErros = {};

        camposObrigatorios[etapa]?.forEach((campo) => {
            if (campo === "assinaturaAluno") {
                if (!sigCanvasAluno.current || sigCanvasAluno.current.isEmpty()) {
                    novosErros[campo] = true;
                }
            } else {
                const valor = getValue(form, campo);
                if (!valor || valor.toString().trim() === "") {
                    novosErros[campo] = true;
                }
            }
        });

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            alert("Preencha todos os campos obrigatórios antes de prosseguir!");
            return false;
        }

        return true;
    };

    const etapaCompleta = (etapa) => {
        const camposObrigatorios = {
            1: ["nome", "nascimento", "email", "rg", "cpf", "telefone", "modalidade", "funcionarioIndicando", "parentesco", "kimono", "chinelo", "camisa", "telefoneFuncionario"],
            2: ["transtorno", "tratamentoSaude", "medicamento"],
            3: ["endereco.cep", "endereco.rua", "endereco.numero", "endereco.bairro", "endereco.cidade", "endereco.linhasOnibus", "endereco.valorVT"],
            4: ["mae.nome", "mae.rg", "mae.cpf", "mae.telefone", "pai.nome", "pai.rg", "pai.cpf", "pai.telefone"],
            5: ["dataDeclaracao", "assinaturaAluno", "termo"]
        };

        const faltando = camposObrigatorios[etapa]?.filter(
            (campo) => {
                const valor = getValue(form, campo);
                return !valor || valor.toString().trim() === "";
            }
        );

        return faltando.length === 0;
    };



    const handleRadioChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (value === "Sim" || value === "ja_cursei") {
            setMostrar((prev) => ({ ...prev, [name]: true }));
        } else {
            setMostrar((prev) => ({ ...prev, [name]: false }));
            setForm((prev) => ({ ...prev, [`${name}Detalhe`]: "" }));
        }
    };





    const handleChange = (e) => {
        const { name, value } = e.target;

        let maskedValue = value;


        if (name === "cpf" || name.endsWith("cpf")) {
            maskedValue = value.replace(/\D/g, "")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        } else if (name === "rg" || name.endsWith("rg")) {
            maskedValue = value.replace(/\D/g, "")
                .replace(/(\d{2})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1-$2");
        } else if (name === "telefone" || name.endsWith("telefone")) {
            maskedValue = value.replace(/\D/g, "")
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2");
        } else if (name === "telefoneFuncionario" || name.endsWith("telefoneFuncionario")) {
            maskedValue = value.replace(/\D/g, "")
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2");
        } else if (name === "cep") {
            maskedValue = value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
        }

        if (name.includes(".")) {
            const [parent, field] = name.split(".");
            setForm({
                ...form,
                [parent]: { ...form[parent], [field]: maskedValue }
            });
        } else {
            setForm({ ...form, [name]: maskedValue });
        }
    };

    const handleCep = async (e) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            try {
                const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                if (!res.data.erro) {
                    setForm(prev => ({
                        ...prev,
                        endereco: {
                            ...prev.endereco,
                            rua: res.data.logradouro,
                            bairro: res.data.bairro,
                            cidade: res.data.localidade
                        }
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarEtapa()) return;

        const assinaturaAlunoData = sigCanvasAluno.current?.toDataURL("image/png");
        let perfilBase64 = null;
        if (form.foto) {
            perfilBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(form.foto);
            });
        }

        const doc = PDFRegister(form, { "Aluno(a)/Responsável": assinaturaAlunoData }, perfilBase64);


        //doc.save(`Karate_${form.nome || ""}_${form.dataDeclaracao || "Aluno"}.pdf`);

        const pdfBlob = doc.output("blob");

        const formData = new FormData();
        formData.append("formularioPDF", pdfBlob, `Karate_${form.nome || ""}_${form.dataDeclaracao || "Aluno"}.pdf`);

        Object.entries(form).forEach(([key, value]) => {
            if (typeof value === "object" && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        });

        const toastId = toast.loading("Enviando PDF, aguarde...");
        try {
            const res = await axios.post(
                "https://escolinha.paranoa.com.br/api/acronis/formulario",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.update(toastId, {
                render: "Formulario enviado com sucesso!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
                closeOnClick: true,
            });

            setTimeout(() => {
                navigate("/successregister");
            }, 3000);


        } catch (err) {
            toast.update(toastId, {
                render: "Erro ao enviar PDF ❌",
                type: "error",
                isLoading: false,
                autoClose: 4000,
                closeOnClick: true,
            });
        }
    };






    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Por favor, selecione uma imagem válida (JPG, PNG, etc.)");
            return;
        }

        setForm(prev => ({ ...prev, foto: file }));

        const previewURL = URL.createObjectURL(file);
        setPreviewFoto(previewURL);

        setErros(prev => {
            const { foto, ...rest } = prev;
            return rest;
        });
    };




    return (
        <Container>
            <ToastContainer position="top-right" theme="colored" />
            <div className="container d-flex justify-content-center text-center justify-content-start  pt-5 mb-5">
                <div className="row mt-5">
                    <div className="col-md-5">
                        <img src={Paranoa} alt="" className="img-fluid ml-3" />
                    </div>
                    <div className="col-md-5">
                        <img src={Datawake} alt="" className="img-fluid" />
                    </div>


                </div>

            </div>
            <div className="container py-4">

                <h1 className="text-center mb-4">FICHA DE INSCRIÇÃO - KARATÊ</h1>
                <form onSubmit={handleSubmit} id="formulario">
                    <div className="form-row mt-5 mb-5 d-flex justify-content-center sticky-top">
                        <ButtonBar className="mt-4 mb-4 mt-md-1 mb-md-1">
                            <NavButton
                                $active={etapa === 1}
                                style={{ backgroundColor: etapaCompleta(1) ? "#84fa84" : undefined }}
                                onClick={() => setEtapa(1)}
                                disabled={etapa < 1}
                            >
                                Candidato
                            </NavButton>

                            <NavButton
                                $active={etapa === 2}
                                style={{ backgroundColor: etapaCompleta(2) ? "#84fa84" : undefined }}
                                onClick={() => setEtapa(2)}
                                disabled={etapa < 2}
                            >
                                Saúde
                            </NavButton>

                            <NavButton
                                $active={etapa === 3}
                                style={{ backgroundColor: etapaCompleta(3) ? "#84fa84" : undefined }}
                                onClick={() => setEtapa(3)}
                                disabled={etapa < 3}
                            >
                                Endereço
                            </NavButton>

                            <NavButton
                                $active={etapa === 4}
                                style={{ backgroundColor: etapaCompleta(4) ? "#84fa84" : undefined }}
                                onClick={() => setEtapa(4)}
                            //disabled={etapa < 4}
                            >
                                Familiares
                            </NavButton>
                        </ButtonBar>


                    </div>


                    {etapa === 1 && (
                        <>

                            <div className="form-row">
                                <div className="form-group col-md-6" style={{ position: "relative" }}>
                                    <label>Nome Completo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nome"
                                        value={form.nome}
                                        onChange={handleChange}
                                        style={{ borderColor: erros["nome"] ? "red" : undefined }}
                                    />
                                    {erros["nome"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Data de Nascimento</label>
                                    <input type="date" className="form-control" name="nascimento" value={form.nascimento} onChange={handleChange} style={{ borderColor: erros["nascimento"] ? "red" : undefined }} />
                                    {erros["nascimento"] && (
                                        <AiOutlineExclamationCircle
                                            style={{
                                                color: "red",
                                                position: "absolute",
                                                right: "40px",
                                                top: "73%",
                                                transform: "translateY(-50%)",
                                                pointerEvents: "none"
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>E-mail</label>
                                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} style={{ borderColor: erros["email"] ? "red" : undefined }} />
                                    {erros["email"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-3">
                                    <label>RG</label>
                                    <input type="text" className="form-control" name="rg" value={form.rg} onChange={handleChange} maxLength="12" style={{ borderColor: erros["rg"] ? "red" : undefined }} />
                                    {erros["rg"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>CPF</label>
                                    <input type="text" className="form-control" name="cpf" value={form.cpf} onChange={handleChange} maxLength="14" style={{ borderColor: erros["cpf"] ? "red" : undefined }} />
                                    {erros["cpf"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Telefone/Celular</label>
                                    <input type="text" className="form-control" name="telefone" value={form.telefone} onChange={handleChange} maxLength="15" style={{ borderColor: erros["telefone"] ? "red" : undefined }} />
                                    {erros["telefone"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Tamanho do Kimono</label>
                                    <input type="text" className="form-control" name="kimono" value={form.kimono} onChange={handleChange} style={{ borderColor: erros["kimono"] ? "red" : undefined }} />
                                    {erros["kimono"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                            </div>


                            <div className="form-row mt-4 mb-4">
                                <div className="form-group col-md-6" style={{ position: "relative", border: erros["foto"] ? "1px solid red" : "none", padding: "10px", borderRadius: "6px" }}>
                                    <label>Adicione uma Foto do Rosto com Fundo Branco</label> <br />

                                    <AddImage
                                        type="button"
                                        className="btn"
                                        onClick={() => document.getElementById("fotoInput").click()}
                                    >
                                        Escolher arquivo
                                    </AddImage>


                                    <input
                                        type="file"
                                        id="fotoInput"
                                        accept="image/*"
                                        onChange={handleFotoChange}
                                        style={{ display: "none" }}
                                        name="foto"
                                    />

                                    {erros["foto"] && <AiOutlineExclamationCircle className="alertError" />}

                                    {previewFoto && (
                                        <div className="mt-3">
                                            <Perfil
                                                src={previewFoto}
                                                alt="Prévia da foto"
                                                style={{
                                                    border: erros["foto"] ? "2px solid red" : "2px solid #ccc",
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                            </div>


                            <div className="form-row">
                                <div className="form-group col-md-3">
                                    <label>Tamanho da Camisa</label>
                                    <select
                                        className="form-control"
                                        name="camisa"
                                        value={form.camisa}
                                        onChange={handleChange}
                                        style={{ borderColor: erros["camisa"] ? "red" : undefined }}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="PP">PP</option>
                                        <option value="P">P</option>
                                        <option value="M">M</option>
                                        <option value="G">G</option>
                                        <option value="GG">GG</option>
                                        <option value="XG">XG</option>
                                    </select>
                                    {erros["camisa"] && <AiOutlineExclamationCircle className="alertError" />}
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Tamanho do Chinelo</label>
                                    <input type="text" className="form-control" name="chinelo" value={form.chinelo} onChange={handleChange} style={{ borderColor: erros["chinelo"] ? "red" : undefined }} />
                                    {erros["chinelo"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>

                            </div>

                            <div
                                className="form-group"
                                style={{
                                    position: "relative",
                                    border: erros["modalidade"] ? "1px solid red" : "1px solid transparent",
                                    borderRadius: "6px",
                                    padding: "8px",
                                }}
                            >
                                <label className="mr-2">Já cursou a modalidade antes?</label> <br />

                                <div className="form-check form-check-inline">
                                    <label className="form-check-label">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="modalidade"
                                            value="iniciante"
                                            checked={form.modalidade === "iniciante"}
                                            onChange={handleRadioChange}
                                        />
                                        Iniciante
                                    </label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <label className="form-check-label">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="modalidade"
                                            value="ja_cursei"
                                            checked={form.modalidade === "ja_cursei"}
                                            onChange={handleRadioChange}
                                        />
                                        Já cursei
                                    </label>
                                </div>


                                {erros["modalidade"] && (
                                    <AiOutlineExclamationCircle className="alertError" />
                                )}


                                {mostrar.modalidade && (
                                    <input
                                        type="text"
                                        name="modalidadeDetalhe"
                                        value={form.modalidadeDetalhe}
                                        onChange={handleChange}
                                        className={`form-control mt-2 ${erros["modalidadeDetalhe"] ? "is-invalid" : ""
                                            }`}
                                        placeholder="Qual faixa está?"
                                    />
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Nome do Funcionário que está indicando</label>
                                    <input type="text" className="form-control" name="funcionarioIndicando" value={form.funcionarioIndicando} onChange={handleChange} style={{ borderColor: erros["funcionarioIndicando"] ? "red" : undefined }} />
                                    {erros["funcionarioIndicando"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Telefone/Celular</label>
                                    <input type="text" className="form-control" name="telefoneFuncionario" value={form.telefoneFuncionario} onChange={handleChange} maxLength="15" style={{ borderColor: erros["telefoneFuncionario"] ? "red" : undefined }} />
                                    {erros["telefoneFuncionario"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>

                                <div className="form-group col-md-3">
                                    <label>Grau de Parentesco</label>
                                    <input type="text" className="form-control" name="parentesco" value={form.parentesco} onChange={handleChange} style={{
                                        borderColor: erros["parentesco"] ? "red" : undefined,
                                        paddingRight: erros["parentesco"] ? "30px" : undefined
                                    }} />

                                    {erros["parentesco"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                            </div>

                            <button type="button" className="btn btn-success mt-3 mr-3" onClick={proximaEtapa}>
                                Continuar
                            </button>

                        </>
                    )}


                    {etapa === 2 && (
                        <>
                            {/* Tratamento de saúde */}
                            <div
                                className="form-group"
                                style={{
                                    position: "relative",
                                    border: erros["tratamentoSaude"]
                                        ? "1px solid red"
                                        : "1px solid transparent",
                                    borderRadius: "6px",
                                    padding: "8px",
                                }}
                            >
                                <label className="mr-1">Faz algum tratamento de saúde?</label> <br />

                                <div className="form-check form-check-inline">
                                    <label className="form-check-label">
                                        <input
                                            type="radio"
                                            name="tratamentoSaude"
                                            value="Não"
                                            onChange={handleRadioChange}
                                            checked={form.tratamentoSaude === "Não"}
                                            className="form-check-input"
                                        />
                                        Não
                                    </label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <label className="form-check-label">
                                        <input
                                            type="radio"
                                            name="tratamentoSaude"
                                            value="Sim"
                                            onChange={handleRadioChange}
                                            checked={form.tratamentoSaude === "Sim"}
                                            className="form-check-input"
                                        />
                                        Sim
                                    </label>
                                </div>

                                {erros["tratamentoSaude"] && (
                                    <AiOutlineExclamationCircle className="alertError" />
                                )}

                                {mostrar.tratamentoSaude && (
                                    <input
                                        type="text"
                                        name="tratamentoSaudeDetalhe"
                                        value={form.tratamentoSaudeDetalhe}
                                        onChange={handleChange}
                                        className={`form-control mt-2 ${erros["tratamentoSaudeDetalhe"] ? "is-invalid" : ""
                                            }`}
                                        placeholder="Qual tratamento?"
                                    />
                                )}
                            </div>


                            <div
                                className="form-group"
                                style={{
                                    position: "relative",
                                    border: erros["transtorno"] ? "1px solid red" : "1px solid transparent",
                                    borderRadius: "6px",
                                    padding: "8px",
                                }}
                            >
                                <label className="mr-1">Possui algum transtorno?</label> <br />

                                <div className="form-check form-check-inline">
                                    <label className="form-check-label">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="transtorno"
                                            value="Não"
                                            checked={form.transtorno === "Não"}
                                            onChange={handleRadioChange}
                                        />
                                        Não
                                    </label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <label className="form-check-label">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="transtorno"
                                            value="Sim"
                                            checked={form.transtorno === "Sim"}
                                            onChange={handleRadioChange}
                                        />
                                        Sim
                                    </label>
                                </div>

                                {erros["transtorno"] && (
                                    <AiOutlineExclamationCircle className="alertError" />
                                )}

                                {mostrar.transtorno && (
                                    <>
                                        <input
                                            type="text"
                                            className={`form-control mt-2 ${erros["transtornoDetalhe"] ? "is-invalid" : ""
                                                }`}
                                            name="transtornoDetalhe"
                                            value={form.transtornoDetalhe}
                                            onChange={handleChange}
                                            placeholder="Qual transtorno?"
                                        />

                                        <div className="form-row mt-2">
                                            <div
                                                className="form-group col-md-6"
                                                style={{
                                                    border: erros["laudo"] ? "1px solid red" : "1px solid transparent",
                                                    borderRadius: "6px",
                                                    padding: "6px",
                                                    position: "relative",
                                                }}
                                            >
                                                <label>Possui Laudo Médico?</label>
                                                <div className="form-check form-check-inline">
                                                    <label className="form-check-label">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="laudo"
                                                            value="Sim"
                                                            checked={form.laudo === "Sim"}
                                                            onChange={handleRadioChange}
                                                        />
                                                        Sim
                                                    </label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <label className="form-check-label">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="laudo"
                                                            value="Não"
                                                            checked={form.laudo === "Não"}
                                                            onChange={handleRadioChange}
                                                        />
                                                        Não
                                                    </label>
                                                </div>

                                                {erros["laudo"] && (
                                                    <AiOutlineExclamationCircle className="alertError" />
                                                )}
                                            </div>
                                        </div>

                                        {mostrar.laudo && (
                                            <>
                                                <div className="form-group col-md-6">
                                                    <label>Qual CID (n°)?</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${erros["cid"] ? "is-invalid" : ""
                                                            }`}
                                                        name="cid"
                                                        value={form.cid}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Acompanhamento com especialista:</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${erros["acompanhamento"] ? "is-invalid" : ""
                                                            }`}
                                                        name="acompanhamento"
                                                        value={form.acompanhamento}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>


                            <div
                                className="form-group"
                                style={{
                                    position: "relative",
                                    border: erros["medicamento"] ? "1px solid red" : "1px solid transparent",
                                    borderRadius: "6px",
                                    padding: "8px",
                                }}
                            >
                                <label className="mr-2">Faz uso de algum medicamento contínuo?</label> <br />

                                <div className="form-check form-check-inline">
                                    <label className="form-check-label">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="medicamento"
                                            value="Não"
                                            checked={form.medicamento === "Não"}
                                            onChange={handleRadioChange}
                                        />
                                        Não
                                    </label>
                                </div>

                                <div className="form-check form-check-inline">
                                    <label className="form-check-label">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="medicamento"
                                            value="Sim"
                                            checked={form.medicamento === "Sim"}
                                            onChange={handleRadioChange}
                                        />
                                        Sim
                                    </label>
                                </div>

                                {erros["medicamento"] && (
                                    <AiOutlineExclamationCircle className="alertError" />
                                )}

                                {mostrar.medicamento && (
                                    <input
                                        type="text"
                                        className={`form-control mt-2 ${erros["medicamentoDetalhe"] ? "is-invalid" : ""
                                            }`}
                                        name="medicamentoDetalhe"
                                        value={form.medicamentoDetalhe}
                                        onChange={handleChange}
                                        placeholder="Qual medicamento?"
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                className="btn btn-danger mt-3 mr-3"
                                onClick={etapaAnterior}
                            >
                                Retornar
                            </button>

                            <button
                                type="button"
                                className="btn btn-success mt-3 mr-3"
                                onClick={proximaEtapa}
                            >
                                Continuar
                            </button>
                        </>

                    )}


                    {etapa === 3 && (
                        <>

                            <div className="form-row">
                                <div className="form-group col-md-3">
                                    <label>CEP</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="endereco.cep"
                                        value={form.endereco.cep}
                                        onChange={(e) => { handleChange(e); handleCep(e); }}
                                        maxLength="9"
                                        style={{ borderColor: erros["endereco.rua"] ? "red" : undefined }}
                                    />
                                    {erros["endereco.cep"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Endereço</label>
                                    <input type="text" className="form-control" name="endereco.rua" value={form.endereco.rua} onChange={handleChange} style={{ borderColor: erros["endereco.rua"] ? "red" : undefined }} />
                                    {erros["endereco.rua"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Número</label>
                                    <input type="number" className="form-control" name="endereco.numero" value={form.endereco.numero} onChange={handleChange} style={{ borderColor: erros["endereco.numero"] ? "red" : undefined }} />
                                    {erros["endereco.numero"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-4">
                                    <label>Bairro</label>
                                    <input type="text" className="form-control" name="endereco.bairro" value={form.endereco.bairro} onChange={handleChange} style={{ borderColor: erros["endereco.bairro"] ? "red" : undefined }} />
                                    {erros["endereco.bairro"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-4">
                                    <label>Cidade</label>
                                    <input type="text" className="form-control" name="endereco.cidade" value={form.endereco.cidade} onChange={handleChange} style={{ borderColor: erros["endereco.cidade"] ? "red" : undefined }} />
                                    {erros["endereco.cidade"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-4">
                                    <label>Complemento</label>
                                    <input type="text" className="form-control" name="endereco.complemento" value={form.endereco.complemento} onChange={handleChange} style={{ borderColor: erros["endereco.complemento"] ? "red" : undefined }} />
                                    {erros["endereco.complemento"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Linhas de Ônibus que possui acesso</label>
                                    <input type="text" className="form-control" name="endereco.linhasOnibus" value={form.endereco.linhasOnibus} onChange={handleChange} style={{ borderColor: erros["endereco.linhasOnibus"] ? "red" : undefined }} />
                                    {erros["endereco.linhasOnibus"] && (
                                        <AiOutlineExclamationCircle className="alertError" style={{ marginTop: "-10px" }} />
                                    )}
                                </div>

                                <div className="form-group col-md-6">
                                    <div className="form-group">
                                        <label>Valor total diário VT R$ (ida e volta)</label>
                                        <input type="number" className="form-control" name="endereco.valorVT" value={form.endereco.valorVT} onChange={handleChange} style={{ borderColor: erros["endereco.valorVT"] ? "red" : undefined }} />
                                        {erros["endereco.linhasOnibus"] && (
                                            <AiOutlineExclamationCircle className="alertError" style={{ marginTop: "-10px" }} />
                                        )}
                                    </div>
                                </div>

                            </div>

                            <button type="button" className="btn btn-danger mt-3 mr-3" onClick={etapaAnterior}>
                                Retornar
                            </button>

                            <button type="button" className="btn btn-success mt-3 mr-3" onClick={proximaEtapa}>
                                Continuar
                            </button>
                        </>

                    )}

                    {etapa === 4 && (
                        <>



                            <h5>Pai</h5>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Nome do Pai</label>
                                    <input type="text" className="form-control" name="pai.nome" value={form.pai.nome} onChange={handleChange} style={{ borderColor: erros["pai.nome"] ? "red" : undefined }} />
                                    {erros["pai.nome"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Telefone/Celular</label>
                                    <input type="text" className="form-control" name="pai.telefone" value={form.pai.telefone} onChange={handleChange} maxLength="15" style={{ borderColor: erros["pai.telefone"] ? "red" : undefined }} />
                                    {erros["pai.telefone"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-3">
                                    <label>RG</label>
                                    <input type="text" className="form-control" name="pai.rg" value={form.pai.rg} onChange={handleChange} maxLength="12" style={{ borderColor: erros["pai.rg"] ? "red" : undefined }} />
                                    {erros["pai.rg"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>CPF</label>
                                    <input type="text" className="form-control" name="pai.cpf" value={form.pai.cpf} onChange={handleChange} maxLength="14" style={{ borderColor: erros["pai.cpf"] ? "red" : undefined }} />
                                    {erros["pai.cpf"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3 text-center">
                                    <label className="mr-2">Desempregado</label> <br />
                                    <div className="form-check form-check-inline">
                                        <label className="form-check-label">
                                            <input className="form-check-input" type="radio" name="pai.desempregado" value="Sim" onChange={handleChange} />
                                            Sim</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <label className="form-check-label">
                                            <input className="form-check-input" type="radio" name="pai.desempregado" value="Não" onChange={handleChange} />
                                            Não</label>
                                    </div>
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Profissão</label>
                                    <input type="text" className="form-control" name="pai.profissao" value={form.pai.profissao} onChange={handleChange} style={{ borderColor: erros["pai.profissao"] ? "red" : undefined }} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control" name="pai.email" value={form.pai.email} onChange={handleChange} style={{ borderColor: erros["pai.email"] ? "red" : undefined }} />
                                {erros["pai.email"] && (
                                    <AiOutlineExclamationCircle
                                        style={{
                                            color: "red",
                                            position: "absolute",
                                            right: "10px",
                                            top: "73%",
                                            transform: "translateY(-50%)",
                                            pointerEvents: "none"
                                        }}
                                    />
                                )}
                            </div>

                            <h5 className="mt-5">Mãe</h5>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Nome da Mãe</label>
                                    <input type="text" className="form-control" name="mae.nome" value={form.mae.nome} onChange={handleChange} style={{ borderColor: erros["mae.nome"] ? "red" : undefined }} />
                                    {erros["mae.nome"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Telefone/Celular</label>
                                    <input type="text" className="form-control" name="mae.telefone" value={form.mae.telefone} onChange={handleChange} maxLength="15" style={{ borderColor: erros["mae.telefone"] ? "red" : undefined }} />
                                    {erros["mae.telefone"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group col-md-3">
                                    <label>RG</label>
                                    <input type="text" className="form-control" name="mae.rg" value={form.mae.rg} onChange={handleChange} maxLength="12" style={{ borderColor: erros["mae.rg"] ? "red" : undefined }} />
                                    {erros["mae.rg"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3">
                                    <label>CPF</label>
                                    <input type="text" className="form-control" name="mae.cpf" value={form.mae.cpf} onChange={handleChange} maxLength="14" style={{ borderColor: erros["mae.cpf"] ? "red" : undefined }} />
                                    {erros["mae.cpf"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-3 text-center">
                                    <label className="mr-2">Desempregada</label> <br />
                                    <div className="form-check form-check-inline">
                                        <label className="form-check-label">
                                            <input className="form-check-input" type="radio" name="mae.desempregada" value="Sim" onChange={handleChange} />
                                            Sim</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <label className="form-check-label">
                                            <input className="form-check-input" type="radio" name="mae.desempregada" value="Não" onChange={handleChange} />
                                            Não</label>
                                    </div>
                                </div>
                                <div className="form-group col-md-3">
                                    <label>Profissão</label>
                                    <input type="text" className="form-control" name="mae.profissao" value={form.mae.profissao} onChange={handleChange} style={{ borderColor: erros["mae.profissao"] ? "red" : undefined }} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control" name="mae.email" value={form.mae.email} onChange={handleChange} style={{ borderColor: erros["mae.email"] ? "red" : undefined }} />
                                {erros["mae.email"] && (
                                    <AiOutlineExclamationCircle
                                        style={{
                                            color: "red",
                                            position: "absolute",
                                            right: "10px",
                                            top: "73%",
                                            transform: "translateY(-50%)",
                                            pointerEvents: "none"
                                        }}
                                    />
                                )}
                            </div>
                            <button type="button" className="btn btn-danger mt-3 mr-3" onClick={etapaAnterior}>
                                Retornar
                            </button>

                            <button type="button" className="btn btn-success mt-3 mr-3" onClick={proximaEtapa}>
                                Continuar
                            </button>
                        </>
                    )}

                    {etapa === 5 && (
                        <>
                            <div className="form-group mt-4">
                                <a href="" style={{ color: "#FDB913" }}>Termos e polícas da empresa.</a>
                                <label>
                                    <p style={{ color: erros["termo"] ? "red" : "inherit" }}>
                                        <input
                                            type="checkbox"
                                            name="termo"
                                            checked={form.termo === "sim"}
                                            onChange={(e) =>
                                                setForm({ ...form, termo: e.target.checked ? "sim" : "" })
                                            }
                                        />{" "}
                                        Li e estou de acordo com os termos e políticas presentes neste documento.
                                        {erros["termo"] && (
                                            <AiOutlineExclamationCircle
                                                style={{ color: "red", marginLeft: "5px" }}
                                            />
                                        )}
                                    </p>
                                </label>

                                <br /><br />
                                <p>
                                    Declaro a veracidade das informações anteriormente declaradas. <br />
                                    Estou ciente de que o vale-transporte é um benefício da empresa e que posso utilizá-lo durante todo o período vigente do contrato de trabalho acordado. <br /><br />
                                    Diadema,{" "}
                                    {new Date().toLocaleDateString("pt-BR", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                    {erros["dataDeclaracao"] && (
                                        <AiOutlineExclamationCircle
                                            style={{ color: "red", marginLeft: "5px" }}
                                        />
                                    )}
                                </p>

                            </div>

                            <div className="row mt-4 d-flex justify-content-center">

                                <div className="col-12 col-md-6 mb-4" style={{ position: "relative" }}>
                                    <div className="text-center">
                                        <SignatureCanvas
                                            ref={sigCanvasAluno}
                                            penColor="black"
                                            canvasProps={{
                                                className: `border w-100 ${erros["assinaturaAluno"] ? "border-danger" : ""}`,
                                                height: 150
                                            }}
                                        />
                                        {erros["assinaturaAluno"] && (
                                            <AiOutlineExclamationCircle className="alertError" />
                                        )}
                                        <small className="d-block mt-2">Assinatura Aluno(a) ou Responsável</small>
                                        <button type="button" className="btn btn-sm btn-warning mt-2" onClick={() => sigCanvasAluno.current.clear()}>Limpar</button>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-4">
                                <button type="submit" className="btn btn-success px-5">Enviar Inscrição</button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </Container>
    );
}

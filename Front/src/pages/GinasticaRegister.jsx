import { useState, useRef, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Paranoa from "../assets/logo-paranoa.png"
import Datawake from "../assets/logoDatawake.png"
import { AiOutlineExclamationCircle } from "react-icons/ai";
import SignatureCanvas from "react-signature-canvas";
import PDFRegister from "../components/PDFRegisterGinastica"
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

export default function GinasticaRegister() {
    const [form, setForm] = useState({

        nome: "",
        nascimento: "",
        email: "",
        rg: "",
        cpf: "",
        telefone: "",
        camisa: "",
        setor: "",
        re: "",



        endereco: {
            cep: "",
            rua: "",
            numero: "",
            bairro: "",
            cidade: "",
            complemento: "",
        },

        termo: "",
        dataDeclaracao: new Date().toISOString().split("T")[0]
    });


    const [etapa, setEtapa] = useState(1);
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
            1: ["nome", "nascimento", "email", "rg", "cpf", "telefone", "setor", "re", "camisa"],
            2: ["endereco.cep", "endereco.rua", "endereco.numero", "endereco.bairro", "endereco.cidade"],
            3: ["dataDeclaracao", "assinaturaAluno", "termo"]
        };

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
            1: ["nome", "nascimento", "email", "rg", "cpf", "telefone", "setor", "re", "camisa"],
            2: ["endereco.cep", "endereco.rua", "endereco.numero", "endereco.bairro", "endereco.cidade"],
            3: ["dataDeclaracao", "assinaturaAluno", "termo"]
        };

        const faltando = camposObrigatorios[etapa]?.filter(
            (campo) => {
                const valor = getValue(form, campo);
                return !valor || valor.toString().trim() === "";
            }
        );

        return faltando.length === 0;
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

        const doc = PDFRegister(form, {
            "Aluno(a)/Responsável": assinaturaAlunoData,
        });


        //doc.save(`Ginastica_${form.dataDeclaracao || ""}_${form.nome || "Aluno"}.pdf`);

        const pdfBlob = doc.output("blob");

        const formData = new FormData();
        formData.append("formularioPDF", pdfBlob, `Ginastica_${form.nome || ""}_${form.dataDeclaracao || "Aluno"}.pdf`);

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

                <h1 className="text-center mb-4">FICHA DE INSCRIÇÃO - GINÁSTICA</h1>
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
                                style={{ backgroundColor: etapaCompleta(1) ? "#84fa84" : undefined }}
                                onClick={() => setEtapa(2)}
                                disabled={etapa < 2}
                            >
                                Endereço
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

                            </div>


                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Setor que Trabalha</label>
                                    <input type="text" className="form-control" name="setor" value={form.setor} onChange={handleChange} style={{ borderColor: erros["setor"] ? "red" : undefined }} />
                                    {erros["setor"] && (
                                        <AiOutlineExclamationCircle className="alertError" />
                                    )}
                                </div>
                                <div className="form-group col-md-4">
                                    <label>RE</label>
                                    <input type="number" className="form-control" name="re" value={form.re} onChange={handleChange} style={{ borderColor: erros["re"] ? "red" : undefined }} />
                                    {erros["re"] && (
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

                            <button type="button" className="btn btn-danger mt-3 mr-3" onClick={etapaAnterior}>
                                Retornar
                            </button>

                            <button type="button" className="btn btn-success mt-3 mr-3" onClick={proximaEtapa}>
                                Continuar
                            </button>
                        </>

                    )}


                    {etapa === 3 && (
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

                                <div className="col-12 col-md-6 mb-4">
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
        </Container >
    );
}

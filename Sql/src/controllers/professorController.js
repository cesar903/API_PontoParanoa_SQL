const Ponto = require("../models/Ponto"); // Usando o Sequelize e exportando o modelo
const Calendario = require("../models/Calendario"); // Para o modelo Calendario
const User = require("../models/User")
const Falta = require("../models/Falta")
const bcrypt = require("bcryptjs");
const moment = require("moment");
const moment2 = require("moment-timezone");
const { format } = require('date-fns');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
require("dotenv").config();
const nodemailer = require("nodemailer");



exports.listarPontosPendentes = async (req, res) => {
    try {
        const pontosPendentes = await Ponto.findAll({
            where: { status: "pendente" },
            include: {
                model: User,
                as: "aluno",
                attributes: ["nome", "email"]
            }
        });


        res.json(pontosPendentes);
    } catch (error) {
        console.error("Erro ao buscar pontos pendentes:", error);
        res.status(500).json({ msg: "Erro ao buscar pontos pendentes" });
    }
};

exports.cadastrarUsuario = async (req, res) => {
    // Desestruturação dos dados enviados no corpo da requisição
    const { nome, email, senha, nasc, cpf, endereco, turma, role } = req.body;

    // Verificação para garantir que todos os campos obrigatórios foram preenchidos
    if (!nome || !email || !senha || !nasc || !role || !endereco || !cpf || !turma) {
        return res.status(400).json({ msg: "Todos os campos são obrigatórios" });
    }

    try {
        // Verifica se já existe um usuário com o e-mail informado
        const usuarioExistente = await User.findOne({ where: { email } });  // Corrigido aqui!
        if (usuarioExistente) {
            return res.status(400).json({ msg: "E-mail já cadastrado" });
        }

        // Criptografa a senha usando bcrypt antes de salvar no banco de dados
        const senhaHash = await bcrypt.hash(senha, 10);

        // Cria um novo usuário com os dados fornecidos
        const novoUsuario = new User({
            nome,
            email,
            senha: senhaHash,
            nasc,
            cpf,
            endereco,
            turma,
            role
        });

        // Salva o novo usuário no banco de dados
        await novoUsuario.save();

        // Resposta de sucesso
        res.status(201).json({ msg: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        res.status(500).json({ msg: "Erro ao cadastrar usuário" });
    }
};



exports.aprovarOuRejeitarPonto = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // "aprovado" ou "rejeitado"

    if (!["aprovado", "rejeitado"].includes(status)) {
        return res.status(400).json({ msg: "Status inválido" });
    }

    try {
        const ponto = await Ponto.findByPk(id); // equivalente ao findById

        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        ponto.status = status;
        await ponto.save();

        res.json({ msg: `Ponto ${status} com sucesso!` });
    } catch (error) {
        console.error("Erro ao atualizar status do ponto:", error);
        res.status(500).json({ msg: "Erro ao atualizar status do ponto" });
    }
};


exports.adicionarPontoManual = async (req, res) => {

    const { alunoId, dia, chegada, saida } = req.body;

    if (!alunoId || !dia || !chegada || !saida) {
        return res.status(400).json({ msg: "Todos os campos são obrigatórios" });
    }

    try {
        const aluno = await User.findByPk(alunoId);

        if (!aluno || aluno.role !== "aluno") {
            return res.status(404).json({ msg: "Aluno não encontrado" });
        }

        const entradaSP = moment.tz(`${dia}T${chegada}:00`, "America/Sao_Paulo").toDate();
        const saidaSP = moment.tz(`${dia}T${saida}:00`, "America/Sao_Paulo").toDate();

        await Ponto.create({
            alunoId,
            entrada: entradaSP,
            saida: saidaSP,
            status: "pendente",
            isOn: false,
        });

        res.status(201).json({ msg: "Ponto manual adicionado com sucesso!" });
    } catch (error) {
        console.error("Erro ao adicionar ponto manual:", error);
        res.status(500).json({ msg: "Erro ao adicionar ponto manual" });
    }
};


exports.listarAlunos = async (req, res) => {
    try {
        const alunos = await User.findAll({
            where: { role: "aluno" },
            attributes: ["id", "nome", "email", "role", "cpf", "nasc", "endereco", "turma"]
        });
        res.json(alunos);
    } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        res.status(500).json({ msg: "Erro ao buscar alunos" });
    }
};

exports.cadastrarDiaLetivo = async (req, res) => {
    const { data, temAula } = req.body;

    if (!data || temAula === undefined) {
        return res.status(400).json({ msg: "Data e temAula são obrigatórios" });
    }

    try {
        const novoDia = new Calendario({ data, temAula });
        await novoDia.save();

        res.status(201).json(novoDia);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao cadastrar dia letivo" });
    }
};
exports.cadastrarDiaLetivo = async (req, res) => {
    const { data, temAula } = req.body;

    if (!data || temAula === undefined) {
        return res.status(400).json({ msg: "Data e temAula são obrigatórios" });
    }

    try {
        const novoDia = await Calendario.create({ data, temAula });
        res.status(201).json(novoDia);
    } catch (error) {
        console.error("Erro ao cadastrar dia letivo:", error);
        res.status(500).json({ msg: "Erro ao cadastrar dia letivo" });
    }
};


exports.listarCalendario = async (req, res) => {
    try {
        const calendario = await Calendario.findAll();
        res.json(calendario);
    } catch (error) {
        console.error("Erro ao buscar calendário:", error);
        res.status(500).json({ msg: "Erro ao buscar calendário" });
    }
};

exports.atualizarDiaLetivo = async (req, res) => {
    const { id } = req.params;
    const { temAula } = req.body;

    if (temAula === undefined) {
        return res.status(400).json({ msg: "O campo temAula é obrigatório" });
    }

    try {
        const dia = await Calendario.findByPk(id); // Usando findByPk para encontrar pelo id
        if (!dia) return res.status(404).json({ msg: "Dia não encontrado" });

        dia.temAula = temAula;
        await dia.save();
        res.json({ msg: "Dia letivo atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar dia letivo:", error);
        res.status(500).json({ msg: "Erro ao atualizar dia letivo" });
    }
};
exports.excluirDiaLetivo = async (req, res) => {
    const { id } = req.params;

    try {
        const dia = await Calendario.findByPk(id); // Usando findByPk para buscar pelo id
        if (!dia) {
            return res.status(404).json({ msg: "Dia letivo não encontrado" });
        }

        await Calendario.destroy({ where: { id } }); // Usando destroy para deletar pelo id
        res.json({ msg: "Dia letivo excluído com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir dia letivo:", error);
        res.status(500).json({ msg: "Erro ao excluir dia letivo" });
    }
};
exports.adicionarAviso = async (req, res) => {
    let { data } = req.params; // Data no formato YYYY-MM-DD
    const { aviso } = req.body;

    // Garantir que a data seja apenas no formato "YYYY-MM-DD"
    data = data.substring(0, 10); // Caso venha com mais caracteres, pegamos só os primeiros 10

    try {
        // Buscar no banco a data exata como string (YYYY-MM-DD)
        const dia = await Calendario.findOne({
            where: { data: data } // Usando where para filtrar a data
        });

        if (!dia) {
            return res.status(404).json({ msg: "Dia não encontrado" });
        }

        dia.aviso = aviso; // Atualiza o aviso do dia
        await dia.save(); // Salva as alterações

        res.json({ msg: "Aviso atualizado com sucesso!", dia });
    } catch (error) {
        console.error("Erro ao adicionar aviso:", error);
        res.status(500).json({ msg: "Erro ao adicionar aviso" });
    }
};

exports.gerarRelatorio = async (req, res) => {
    const { alunoId } = req.params;
    const { mes, ano } = req.query;

    const timezone = "America/Sao_Paulo";

    if (!mes || !ano) {
        return res.status(400).json({ msg: "Mês e ano são obrigatórios" });
    }

    try {
        const mesNumero = parseInt(mes) - 1;
        const anoNumero = parseInt(ano);

        const inicioMes = moment.tz({ year: anoNumero, month: mesNumero, day: 1 }, timezone).startOf('day').toDate();
        const fimMes = moment.tz(inicioMes, timezone).endOf('month').toDate();

        const pontosPendentes = await Ponto.findAll({
            where: { alunoId, status: "aprovado" },
            include: {
                model: User,
                as: 'aluno',
                attributes: ['nome', 'email']
            }
        });

        const faltasJustificadas = await Falta.findAll({
            where: {
                alunoId,
                data: {
                    [Op.between]: [inicioMes, fimMes]
                }
            },
            order: [['data', 'ASC']]
        });

        const faltasJustificadasArray = faltasJustificadas.map(falta => ({
            data: moment.tz(falta.data, timezone).format("DD/MM/YYYY"),
            motivo: falta.motivo
        }));

        

        const relatorio = pontosPendentes.map(ponto => {
            const entrada = moment.tz(ponto.entrada, timezone);
            const saida = ponto.saida ? moment.tz(ponto.saida, timezone) : null;

            return {
                nome: ponto.aluno.nome,
                email: ponto.aluno.email,
                data: entrada.format("DD/MM/YYYY"),
                checkIn: entrada.format("HH:mm:ss"),
                checkOut: saida ? saida.format("HH:mm:ss") : "-",
                status: ponto.status,
            };
        });
        res.json({ relatorio, faltasJustificadasArray });
    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        res.status(500).json({ msg: "Erro ao gerar relatório de pontos pendentes" });
    }
};


exports.editarPonto = async (req, res) => {
    const { id } = req.params;
    let { entrada, saida } = req.body;

    try {
        // Buscar o ponto com o id fornecido
        const ponto = await Ponto.findOne({ where: { id } });
        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        const timezone = "America/Sao_Paulo";

        // Atualizar a entrada, se fornecida
        if (entrada) {
            ponto.entrada = moment2.tz(entrada, ["DD-MM-YYYY HH:mm", "YYYY-MM-DD HH:mm"], timezone).toDate();
        }

        // Atualizar a saída, se fornecida
        if (saida) {
            ponto.saida = moment2.tz(saida, ["DD-MM-YYYY HH:mm", "YYYY-MM-DD HH:mm"], timezone).toDate();
        }

        console.log("Entrada convertida:", ponto.entrada);
        console.log("Saída convertida:", ponto.saida);

        // Salvar as mudanças no banco de dados
        await ponto.save();
        res.json({ msg: "Ponto atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao editar ponto:", error);
        res.status(500).json({ msg: "Erro ao editar ponto" });
    }
};


exports.excluirAluno = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar o aluno pelo id
        const aluno = await User.findOne({ where: { id } });
        if (!aluno) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        // Verificar se o usuário não é um aluno
        if (aluno.role !== "aluno") {
            return res.status(403).json({ msg: "Apenas alunos podem ser excluídos." });
        }

        // Excluir o aluno
        await User.destroy({ where: { id } });

        res.status(200).json({ msg: "Aluno excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        res.status(500).json({ msg: "Erro ao excluir aluno." });
    }
};


exports.atualizarAluno = async (req, res) => {
    const { id } = req.params;
    const { nome, email, nasc, cpf, endereco, turma } = req.body;

    try {
        // Buscar o aluno pelo id
        const aluno = await User.findOne({ where: { id } });
        if (!aluno) {
            return res.status(404).json({ msg: "Aluno não encontrado" });
        }

        // Atualizar os campos que foram enviados
        if (nome) aluno.nome = nome;
        if (email) aluno.email = email;
        if (nasc) aluno.nasc = nasc;
        if (cpf) aluno.cpf = cpf;
        if (endereco) aluno.endereco = endereco;
        if (turma) aluno.turma = turma;

        // Salvar as alterações
        await aluno.save();
        res.json({ msg: "Aluno atualizado com sucesso!", aluno });
    } catch (error) {
        console.error("Erro ao atualizar aluno:", error);
        res.status(500).json({ msg: "Erro ao atualizar aluno" });
    }
};


exports.contarFaltas = async (req, res) => {
    const { alunoId } = req.params;
    const { mes, ano } = req.query;

    try {
        const inicioMes = new Date(ano, mes - 1, 1);
        const fimMes = new Date(ano, mes, 1);

        // Buscar os dias letivos no Calendário
        const diasLetivos = await Calendario.findAll({
            where: {
                data: {
                    [Sequelize.Op.gte]: inicioMes,
                    [Sequelize.Op.lte]: fimMes
                },
                temAula: true
            }
        });

        // Buscar os pontos aprovados do aluno
        const pontosAprovados = await Ponto.findAll({
            where: {
                alunoId,
                status: "aprovado",
                entrada: {
                    [Sequelize.Op.gte]: inicioMes,
                    [Sequelize.Op.lte]: fimMes
                }
            }
        });

        // Criar um Set com as datas de pontos aprovados
        const datasPontos = new Set(
            pontosAprovados.map((ponto) => ponto.entrada.toISOString().split("T")[0])
        );

        // Filtrar faltas
        const faltas = diasLetivos
            .map((dia) => {
                const dataFormatada = dia.data; // já está no formato 'YYYY-MM-DD'
                if (!datasPontos.has(dataFormatada)) {
                    return { data: dataFormatada, motivo: "Falta não justificada" };
                }
                return null;
            })
            .filter((f) => f !== null);


        res.json({
            totalFaltas: faltas.length,
            faltas: faltas
        });
    } catch (error) {
        console.error("Erro ao contar faltas:", error);
        res.status(500).json({ msg: "Erro ao contar faltas" });
    }
};
exports.excluirPonto = async (req, res) => {
    const { id } = req.params;


    try {
        const ponto = await Ponto.findByPk(id); // Usando findByPk para buscar por ID
        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        await Ponto.destroy({ where: { id } }); // Usando destroy para excluir
        res.json({ msg: "Ponto excluído com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir ponto:", error);
        res.status(500).json({ msg: "Erro ao excluir ponto" });
    }
};


exports.finalizarPonto = async (req, res) => {
    const { id } = req.params;

    try {
        const ponto = await Ponto.findByPk(id); // Usando findByPk para buscar por ID
        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        if (ponto.saida) {
            return res.status(400).json({ msg: "O ponto já foi finalizado" });
        }

        // Define a saída com o horário correto do servidor
        const timezone = "America/Sao_Paulo"; // Defina o fuso horário desejado
        ponto.saida = moment().tz(timezone).format(); // Formato ISO 8601 com timezone
        ponto.status = "pendente";
        ponto.isOn = false;

        await ponto.save();

        return res.json({ msg: "Ponto finalizado com sucesso!", ponto });
    } catch (error) {
        console.error("Erro ao finalizar ponto:", error);
        return res.status(500).json({ msg: "Erro ao finalizar ponto", error: error.message });
    }
};


exports.enviarRelatorio = async (req, res) => {
    try {
        const { alunoId } = req.params;
        const { mes, ano } = req.body;
        const pdfBuffer = req.file.buffer;

        // Busca no banco com Sequelize (MySQL)
        const user = await User.findByPk(alunoId); // <-- equivalente ao findById do Mongo

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        console.log(mes, ano);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Relatório Mensal - ${user.nome} (${mes}/${ano})`,
            text: `Olá, segue em anexo o relatório mensal de ${user.nome}.`,
            attachments: [
                {
                    filename: `relatorio_${user.nome}_${mes}_${ano}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Relatório enviado com sucesso!" });
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        return res.status(500).json({ error: "Erro ao enviar relatório." });
    }
};

// Transporter permanece igual
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});


exports.adicionarFaltaJustificada = async (req, res) => {
    console.log("Parâmetros recebidos:", req.params, req.body);
    const { alunoId } = req.params;
    const { data, justificada, motivo } = req.body;

    if (!alunoId || !data) {
        return res.status(400).json({ msg: "Aluno e data são obrigatórios" });
    }

    try {
        // Busca o usuário pelo PK com Sequelize
        const aluno = await User.findByPk(alunoId);

        if (!aluno || aluno.role !== "aluno") {
            return res.status(404).json({ msg: "Aluno não encontrado" });
        }

        // Cria a falta usando Sequelize
        const novaFalta = await Falta.create({
            alunoId,
            data, // Sequelize aceita string ISO para DATEONLY
            justificada: justificada || false,
            motivo: justificada ? motivo || "Justificativa não informada" : "",
        });

        res.status(201).json({ msg: "Falta registrada com sucesso!", falta: novaFalta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao registrar falta" });
    }
};
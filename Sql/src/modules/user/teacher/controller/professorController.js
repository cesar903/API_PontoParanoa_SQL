const Ponto = require("../../../point/models/Ponto");
const Calendario = require("../../../calendar/models/Calendario");
const User = require("../../models/User")
const Falta = require("../../../fouls/models/Faltas")
const Turmas = require("../../../classes/models/Turmas")
const AlunosTurmas = require("../../../classesStudents/models/alunosTurmas");
const ProfessorTipo = require("../../teacher/models/professor")
const TurmaProfessor = require("../models/turmaProfessor");
const Endereco = require("../../../address/models/address");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const moment2 = require("moment-timezone");
const { format } = require('date-fns');
const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');
const { sequelize } = require("../../../../config/db")
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

    const {
        nome,
        email,
        senha,
        nasc,
        cpf,
        endereco,
        role,
        professorTipo,
        turmas,
    } = req.body;

    if (!nome || !email || !senha || !cpf || !endereco || !nasc || !role) {
        return res.status(400).json({ msg: "Todos os campos são obrigatórios" });
    }

    try {
        const usuarioExistente = await User.findOne({ where: { ds_email: email } });
        if (usuarioExistente) {
            return res.status(400).json({ msg: "E-mail já cadastrado" });
        }
    } catch (error) {
        console.error("Erro ao verificar usuário:", error);
        return res.status(500).json({ msg: "Erro interno ao verificar usuário." });
    }

    const t = await sequelize.transaction();

    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        let idProfessorTipo = null;

        const novoUsuario = await User.create({
            nm_usuario: nome,
            ds_email: email,
            ds_senha_hash: senhaHash,
            nr_cpf: cpf,
            dt_nascimento: nasc,
            tp_usuario: role,
            id_professor_tipo: null,
            ds_foto_3_4: null,
            dt_criado_em: new Date(),
            dt_atualizado_em: new Date(),
        }, { transaction: t });


        await Endereco.create({
            pk_logradouro: endereco.pk_logradouro || null,
            ds_logradouro: endereco.ds_logradouro,
            ds_numero: endereco.ds_numero,
            ds_complemento: endereco.ds_complemento,
            nm_bairro: endereco.nm_bairro,
            nm_cidade: endereco.nm_cidade,
            sg_estado: endereco.sg_estado,
            nr_cep: endereco.nr_cep,
            pk_usuario: novoUsuario.pk_usuario,
        }, { transaction: t });

        if (role === "professor") {
            const novoTipo = await ProfessorTipo.create({
                nm_professor_tipo: professorTipo.nomeTipo,
                ds_descricao: professorTipo.descricao,
            }, { transaction: t });
            idProfessorTipo = novoTipo.pk_professor_tipo;

            await novoUsuario.update({
                id_professor_tipo: idProfessorTipo
            }, { transaction: t });

            if (turmas && turmas.length > 0) {
                const associacoesProfessorTurma = turmas.map(turmaId => ({
                    id_professor: novoUsuario.pk_usuario,
                    id_turma: turmaId,
                }));

                await TurmaProfessor.bulkCreate(associacoesProfessorTurma, { transaction: t });
            }
        }

        if (role === "aluno" || (role !== "professor" && turmas && turmas.length > 0)) {
            const associacoesAlunoTurma = turmas.map(turmaId => ({
                id_aluno: novoUsuario.pk_usuario,
                id_turma: turmaId,
                dt_criado_em: new Date(),
            }));
            await AlunosTurmas.bulkCreate(associacoesAlunoTurma, { transaction: t });
        }

        await t.commit();
        return res.status(201).json({
            msg: "Cadastrado com sucesso!",
            usuario: { id: novoUsuario.pk_usuario, role: role },
        });

    } catch (error) {
        await t.rollback();
        console.error("Erro ao cadastrar usuário (Transação desfeita):", error);
        res.status(500).json({ msg: "Erro ao cadastrar usuário" });
    }
};



exports.listarTurmas = async (req, res) => {
    try {
        const turmas = await Turmas.findAll({
            where: { fl_ativa: true }
        });

        return res.json(turmas);

    } catch (error) {
        console.error("Erro ao listar turmas:", error);
        return res.status(500).json({ msg: "Erro ao buscar turmas" });
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
            attributes: ["id", "nome", "email", "role", "cpf", "nasc", "endereco", "turma", "ginastica", "karate"]
        });
        res.json(alunos);
    } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        res.status(500).json({ msg: "Erro ao buscar alunos" });
    }
};

exports.cadastrarDiaLetivo = async (req, res) => {
    const { data, temAula, turma_id } = req.body;
    const professorId = req.user.id;

    if (!data || temAula === undefined || !turma_id) {
        return res.status(400).json({ msg: "Data, temAula e turma_id são obrigatórios." });
    }

    try {
        const turma = await Turmas.findOne({
            where: { pk_turma: turma_id, fl_ativa: true },
            include: [{
                model: User,
                as: 'professores',
                where: { pk_usuario: professorId },
                attributes: [],
                required: true,
            }],
        });

        if (!turma) {
            return res.status(403).json({ msg: "Você não é responsável por essa turma ou ela está inativa." });
        }

        const novoDia = await Calendario.create({
            dt_aula: data,
            fl_tem_aula: temAula,
            id_turma: turma_id,
        });

        res.status(201).json(novoDia);
    } catch (error) {
        console.error("Erro ao cadastrar dia letivo:", error);
        res.status(500).json({ msg: "Erro ao cadastrar dia letivo", error: error.message });
    }
};


exports.listarCalendario = async (req, res) => {
    try {
        const { role, id } = req.user;
        const { turmaId } = req.query;

        if (role !== "professor") {
            return res.status(403).json({ msg: "Acesso negado. Somente professores podem visualizar." });
        }
        if (!turmaId) {

            const turmasDoProfessor = await Turmas.findAll({
                where: { fl_ativa: true },
                attributes: ["pk_turma", "nm_turma", "ds_turma"],
                include: [{
                    model: User,
                    as: 'professores',
                    where: { pk_usuario: id },
                    attributes: [],
                    through: { attributes: [] }
                }],
            });

            if (!turmasDoProfessor.length) {
                return res.status(404).json({ msg: "Nenhuma turma vinculada ao professor." });
            }

            const turmaIds = turmasDoProfessor.map(t => t.pk_turma);

            const calendario = await Calendario.findAll({
                where: { id_turma: turmaIds },
                order: [["dt_data", "data"]],
            });

            return res.json(calendario);
        }

        const turma = await Turmas.findOne({
            where: { pk_turma: turmaId, fl_ativa: true },
            include: [{
                model: User,
                as: 'professores',
                where: { pk_usuario: id },
                attributes: [],
                through: { attributes: [] }
            }],
        });

        if (!turma) {
            return res
                .status(403)
                .json({ msg: "Você não tem permissão para acessar esta turma ou ela não existe." });
        }

        const calendario = await Calendario.findAll({
            where: { id_turma: turmaId },
            order: [["dt_aula", "ASC"]],
            attributes: [
                ["pk_calendario", "id"],
                ["id_turma", "id_turma"],
                ["dt_aula", "data"],
                ["fl_tem_aula", "temAula"],
                [Sequelize.literal(`NULLIF(ds_aviso, '')`), "aviso"],
                "dt_criado_em",
                "hr_inicio",
                "hr_fim",
            ],
        });


        return res.json(calendario);

    } catch (error) {
        console.error("Erro ao buscar calendário:", error);
        res.status(500).json({ msg: "Erro ao buscar calendário." });
    }
};

exports.atualizarDiaLetivo = async (req, res) => {
    const { id } = req.params;
    const { temAula, turma_id } = req.body;
    const professorId = req.user.id;

    if (temAula === undefined || !turma_id) {
        return res.status(400).json({ msg: "Campos temAula e turma_id são obrigatórios" });
    }

    try {
        const turma = await Turmas.findOne({
            where: { pk_turma: turma_id, fl_ativa: true },
            include: [{
                model: User,
                as: 'professores',
                where: { pk_usuario: professorId },
                required: true,
                attributes: []
            }],
        });

        if (!turma) {
            return res.status(403).json({ msg: "Você não é responsável por essa turma ou ela está inativa." });
        }

        const [updatedCount] = await Calendario.update(
            { fl_tem_aula: temAula },
            {
                where: {
                    pk_calendario: id,
                    id_turma: turma_id
                }
            }
        );

        if (updatedCount === 0) {
            return res.status(404).json({ msg: "Dia letivo não encontrado ou não pertence à turma especificada." });
        }

        const diaAtualizado = await Calendario.findByPk(id);
        res.json({ msg: "Dia letivo atualizado com sucesso!", dia: diaAtualizado });

    } catch (error) {
        console.error("Erro ao atualizar dia letivo:", error);
        res.status(500).json({ msg: "Erro ao atualizar dia letivo", error: error.message });
    }
};




exports.excluirDiaLetivo = async (req, res) => {
    const { id } = req.params;

    try {
        const dia = await Calendario.findByPk(id);
        if (!dia) {
            return res.status(404).json({ msg: "Dia letivo não encontrado" });
        }

        await Calendario.destroy({ where: { pk_calendario: id } });
        res.json({ msg: "Dia letivo excluído com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir dia letivo:", error);
        res.status(500).json({ msg: "Erro ao excluir dia letivo" });
    }
};



exports.adicionarAviso = async (req, res) => {
    let { turmaId, data } = req.params;
    const { aviso } = req.body;
    data = data.substring(0, 10);

    console.log("Aviso recebido:", aviso);
    console.log("Data:", data);
    console.log("Turma ID:", turmaId);

    try {
        const dia = await Calendario.findOne({
            where: {
                dt_aula: data,
                id_turma: turmaId
            }
        });

        if (!dia) {
            return res.status(404).json({ msg: "Dia não encontrado para essa turma" });
        }

        dia.ds_aviso = aviso;
        await dia.save();

        res.json({ msg: "Aviso atualizado com sucesso!", dia });
    } catch (error) {
        console.error("Erro ao adicionar aviso:", error);
        res.status(500).json({ msg: "Erro ao adicionar aviso", error: error.message });
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
            id: falta.id,
            data: moment.tz(falta.data, timezone).format("DD/MM/YYYY"),
            motivo: falta.motivo
        }));

        console.log("Faltas justificadas:", faltasJustificadasArray);


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
        const ponto = await Ponto.findOne({ where: { id } });
        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        const timezone = "America/Sao_Paulo";

        if (entrada) {
            ponto.entrada = moment2.tz(entrada, ["DD-MM-YYYY HH:mm", "YYYY-MM-DD HH:mm"], timezone).toDate();
        }

        if (saida) {
            ponto.saida = moment2.tz(saida, ["DD-MM-YYYY HH:mm", "YYYY-MM-DD HH:mm"], timezone).toDate();
        }

        console.log("Entrada convertida:", ponto.entrada);
        console.log("Saída convertida:", ponto.saida);

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
    const { nome, email, nasc, cpf, endereco, turma, karate, ginastica } = req.body;

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
        if (karate !== undefined) aluno.karate = karate;
        if (ginastica !== undefined) aluno.ginastica = ginastica;


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
        // Define início do mês e início do próximo mês para filtro exclusivo
        const inicioMes = new Date(Date.UTC(ano, mes - 1, 1));       // ex: 2025-07-01T00:00:00Z
        const inicioProximoMes = new Date(Date.UTC(ano, mes, 1));    // ex: 2025-08-01T00:00:00Z

        // Buscar os dias letivos no Calendário com temAula = true
        const diasLetivos = await Calendario.findAll({
            where: {
                data: {
                    [Op.gte]: inicioMes,
                    [Op.lt]: inicioProximoMes,   // menor que o próximo mês para evitar pegar dia a mais
                },
                temAula: true,
            }
        });

        // Buscar os pontos aprovados do aluno dentro do intervalo
        const pontosAprovados = await Ponto.findAll({
            where: {
                alunoId,
                status: "aprovado",
                entrada: {
                    [Op.gte]: inicioMes,
                    [Op.lt]: inicioProximoMes,
                },
            }

        });

        // Criar um Set com as datas dos pontos aprovados (YYYY-MM-DD)
        const datasPontos = new Set(
            pontosAprovados.map(ponto => ponto.entrada.toISOString().split('T')[0])
        );

        // Filtrar faltas (dias letivos que não possuem ponto aprovado)
        const faltas = diasLetivos
            .map(dia => {
                const dataFormatada = dia.data.toISOString ? dia.data.toISOString().split('T')[0] : dia.data;
                // Se 'dia.data' for Date, converte, senão já é string

                if (!datasPontos.has(dataFormatada)) {
                    return { data: dataFormatada, motivo: "Falta não justificada" };
                }
                return null;
            })
            .filter(f => f !== null);

        res.json({
            totalFaltas: faltas.length,
            faltas
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
    host: "smtp.datawake.com.br",
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

exports.excluirFaltaJustificada = async (req, res) => {
    const { faltaId } = req.params;
    console.log("ID da falta a ser excluída:", faltaId);

    try {
        // Tenta deletar a falta com o ID recebido
        const deletedCount = await Falta.destroy({
            where: { id: faltaId } // ou 'faltaId' dependendo do nome da chave primária no seu model
        });

        if (deletedCount === 0) {
            return res.status(404).json({ msg: "Falta não encontrada." });
        }

        res.status(200).json({ msg: "Falta excluída com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir falta:", error);
        res.status(500).json({ msg: "Erro ao excluir falta." });
    }
};

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
        if (req.user.role !== "professor") {
            return res.status(403).json({ msg: "Acesso negado. Apenas professores podem visualizar." });
        }

        const { turmaId } = req.query;

        const whereClause = { tp_status: "pendente" };
        if (turmaId) {
            whereClause.id_turma = turmaId;
        }

        const pontosPendentes = await Ponto.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: "aluno",
                    attributes: ["pk_usuario", "nm_usuario", "ds_email"]
                }
            ],
            order: [["dt_criado_em", "DESC"]]
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
            ds_logradouro: endereco.ds_logradouro,
            ds_numero: endereco.ds_numero,
            ds_complemento: endereco.ds_complemento,
            nm_bairro: endereco.nm_bairro,
            nm_cidade: endereco.nm_cidade,
            sg_estado: endereco.sg_estado,
            nr_cep: endereco.nr_cep,
            id_usuario: novoUsuario.pk_usuario,
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
    const { status } = req.body;


    if (!["aprovado", "rejeitado"].includes(status)) {
        return res.status(400).json({ msg: "Status inválido" });
    }

    try {
        const ponto = await Ponto.findByPk(id);

        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        ponto.status = status;
        await ponto.update({
            tp_status: status,
            dt_atualizado_em: new Date(),
        });

        res.json({ msg: `Ponto ${status} com sucesso!` });
    } catch (error) {
        console.error("Erro ao atualizar status do ponto:", error);
        res.status(500).json({ msg: "Erro ao atualizar status do ponto" });
    }
};


exports.adicionarPontoManual = async (req, res) => {

    const { alunoId, dia, chegada, saida, turmaId } = req.body;
    if (!dia || !chegada || !saida)
        return res.status(400).json({ msg: "Por favor, preencha todos os campos." });

    const dt_entrada = moment.tz(`${dia}T${chegada}:00`, "America/Sao_Paulo").toDate();
    const dt_saida = moment.tz(`${dia}T${saida}:00`, "America/Sao_Paulo").toDate();

    const calendario = await Calendario.findOne({
        where: { dt_aula: dia }
    });

    if (!calendario)
        return res.status(400).json({ msg: "Nenhuma aula encontrado para esse dia." });

    await Ponto.create({
        id_aluno: alunoId,
        id_turma: turmaId,
        id_calendario: calendario.pk_calendario,
        dt_entrada: dt_entrada,
        dt_saida: dt_saida,
        tp_status: "pendente",
        fl_is_on: false
    });


    res.status(201).json({ msg: "Ponto manual adicionado com sucesso!" });
};


exports.listarAlunos = async (req, res) => {
    try {
        const alunos = await User.findAll({
            where: { tp_usuario: "aluno" },
            include: [
                {
                    model: Turmas,
                    as: "turmas",
                    attributes: ["pk_turma", "nm_turma", "fl_ativa"],
                    through: { attributes: [] },
                }
            ],
            attributes: [
                "pk_usuario",
                "nm_usuario",
                "ds_email",
                "nr_cpf",
                "dt_nascimento"
            ]
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
    let { dt_entrada, dt_saida } = req.body;

    try {
        const ponto = await Ponto.findOne({ where: { pk_ponto: id } });
        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        const timezone = "America/Sao_Paulo";

        if (dt_entrada) {
            ponto.dt_entrada = moment2
                .tz(dt_entrada, ["YYYY-MM-DD HH:mm", "DD-MM-YYYY HH:mm"], timezone)
                .toDate();
        }

        if (dt_saida) {
            ponto.dt_saida = moment2
                .tz(dt_saida, ["YYYY-MM-DD HH:mm", "DD-MM-YYYY HH:mm"], timezone)
                .toDate();
        }

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

        const aluno = await User.findOne({ where: { pk_usuario: id } });
        if (!aluno) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        if (aluno.tp_usuario !== "aluno") {
            return res.status(403).json({ msg: "Apenas alunos podem ser excluídos." });
        }

        await aluno.setTurmas([]);

        await User.destroy({ where: { pk_usuario: id } });

        res.status(200).json({ msg: "Aluno excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir aluno:", error);
        res.status(500).json({ msg: "Erro ao excluir aluno." });
    }
};


exports.atualizarAluno = async (req, res) => {
    const { id } = req.params;
    const {
        nome,
        email,
        nasc,
        cpf,
        endereco,
        role,
        professorTipo,
        descricaoProfessor,
        turmas
    } = req.body;

    const t = await sequelize.transaction();

    try {
        const usuario = await User.findOne({ where: { pk_usuario: id } });
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        await usuario.update({
            nm_usuario: nome,
            ds_email: email,
            nr_cpf: cpf,
            dt_nascimento: nasc,
            tp_usuario: role,
            id_professor_tipo: professorTipo || null,
            ds_descricao: descricaoProfessor || null,
            dt_atualizado_em: new Date(),
        }, { transaction: t });


        const enderecoExistente = await Endereco.findOne({ where: { id_usuario: id } });

        const enderecoPayload = {
            ds_logradouro: endereco.ds_logradouro,
            ds_numero: endereco.ds_numero,
            ds_complemento: endereco.ds_complemento,
            nm_bairro: endereco.nm_bairro,
            nm_cidade: endereco.nm_cidade,
            sg_estado: endereco.sg_estado,
            nr_cep: endereco.nr_cep,
            id_usuario: id,
        };

        if (enderecoExistente) {
            await Endereco.update(enderecoPayload, {
                where: { pk_endereco: enderecoExistente.pk_endereco },
                transaction: t
            });
        } else {
            await Endereco.create(enderecoPayload, { transaction: t });
        }

        await AlunosTurmas.destroy({ where: { id_aluno: id }, transaction: t });
        await TurmaProfessor.destroy({ where: { id_professor: id }, transaction: t });

        if (turmas && turmas.length > 0) {

            if (role === "aluno") {
                const associacoesAlunoTurma = turmas.map(turmaId => ({
                    id_aluno: id,
                    id_turma: turmaId,
                    dt_criado_em: new Date(),
                }));
                await AlunosTurmas.bulkCreate(associacoesAlunoTurma, { transaction: t });

            } else if (role === "professor") {
                const associacoesProfessorTurma = turmas.map(turmaId => ({
                    id_professor: id,
                    id_turma: turmaId,
                    dt_criado_em: new Date(),
                }));
                await TurmaProfessor.bulkCreate(associacoesProfessorTurma, { transaction: t });
            }
        }
        await t.commit();
        res.json({ msg: `Usuário ${role} atualizado com sucesso!` });
    } catch (error) {
        await t.rollback();
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ msg: "Erro ao atualizar usuário", error: error.message });
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
        const ponto = await Ponto.findByPk(id);

        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        await Ponto.destroy({ where: { pk_ponto: id } });

        return res.json({ msg: "Ponto excluído com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir ponto:", error);
        return res.status(500).json({ msg: "Erro ao excluir ponto" });
    }
};



exports.finalizarPonto = async (req, res) => {
    const { id } = req.params;

    try {
        const ponto = await Ponto.findByPk(id);

        if (!ponto) {
            return res.status(404).json({ msg: "Ponto não encontrado" });
        }

        if (ponto.dt_saida) {
            return res.status(400).json({ msg: "O ponto já foi finalizado" });
        }

        const timezone = "America/Sao_Paulo";

        const saidaFormatada = moment().tz(timezone).format("YYYY-MM-DDTHH:mm:ss");

        ponto.dt_saida = saidaFormatada;
        ponto.tp_status = "pendente";
        ponto.fl_is_on = false;
        ponto.dt_atualizado_em = new Date();

        await ponto.save();

        return res.json({
            msg: "Ponto finalizado com sucesso!",
            ponto,
        });
    } catch (error) {
        console.error("Erro ao finalizar ponto:", error);
        return res.status(500).json({
            msg: "Erro ao finalizar ponto",
            error: error.message,
        });
    }
};



exports.enviarRelatorio = async (req, res) => {
    try {
        const { alunoId } = req.params;
        const { mes, ano } = req.body;
        const pdfBuffer = req.file.buffer;

        const user = await User.findByPk(alunoId); 

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
    const { alunoId } = req.params;
    const { data, motivo, idTurma } = req.body;


    if (!alunoId || !data) {
        return res.status(400).json({ msg: "Aluno e data são obrigatórios" });
    }

    try {
        await User.findByPk(alunoId);

        const calendario = await Calendario.findOne({
            where: { dt_aula: data }
        });

        if (!calendario) {
            return res.status(404).json({ msg: "Dia não encontrado no calendário" });
        }

        const novaFalta = await Falta.create({
            id_aluno: alunoId,
            id_calendario: calendario.pk_calendario,
            id_turma: idTurma,
            ds_motivo: motivo || "",
            fl_gerada_auto: false
        });

        res.status(201).json({
            msg: "Falta justificada registrada com sucesso!",
            falta: novaFalta
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Dia sem aula." });
    }
};

exports.buscarFaltasPorAluno = async (req, res) => {
    const { alunoId } = req.params;
    const { mes, ano, turmaId } = req.query;

    if (!alunoId || !mes || !ano || !turmaId) {
        return res.status(400).json({ msg: "Aluno, mês, ano e turmaId são obrigatórios." });
    }

    try {
        const aluno = await User.findByPk(alunoId);
        if (!aluno || aluno.tp_usuario !== "aluno") {
            return res.status(404).json({ msg: "Aluno não encontrado." });
        }

        const calendarios = await Calendario.findAll({
            where: {
                dt_aula: {
                    [Op.gte]: `${ano}-${mes}-01`,
                    [Op.lt]: `${ano}-${Number(mes) + 1}-01`
                }
            },
            attributes: ["pk_calendario", "dt_aula"]
        });

        const idsCalendarios = calendarios.map(c => c.pk_calendario);

        const faltas = await Falta.findAll({
            where: {
                id_aluno: alunoId,
                id_turma: turmaId,     
                id_calendario: idsCalendarios
            },
            include: [
                {
                    model: Calendario,
                    as: "calendario",
                    attributes: ["dt_aula"]
                }
            ]
        });

        res.status(200).json({
            aluno: aluno.nm_usuario,
            mes,
            ano,
            faltas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar faltas do aluno." });
    }
};



exports.excluirFaltaJustificada = async (req, res) => {
    const { faltaId } = req.params;

    try {

        const deletedCount = await Falta.destroy({
            where: { pk_falta: faltaId }
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

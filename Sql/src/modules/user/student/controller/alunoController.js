const Ponto = require("../../../point/models/Ponto");
const { Calendario, Turmas, User } = require("../../../associations/models/associations");

const moment = require("moment-timezone");
const { Op, Sequelize } = require("sequelize");



exports.verPontos = async (req, res) => {
    try {
        if (req.user.role === "professor") {
            const { alunoId } = req.params;
            if (!alunoId) return res.status(400).json({ msg: "ID do aluno é necessário." });

            const pontos = await Ponto.findAll({
                where: { id_aluno: alunoId },
                order: [["pk_ponto", "ASC"]]
            });

            return res.json(pontos);
        }

        const pontos = await Ponto.findAll({
            where: { id_aluno: req.user.id },
            order: [["pk_ponto", "ASC"]]
        });

        res.json(pontos);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao buscar os pontos.", error });
    }
};


exports.fazerCheckin = async (req, res) => {
    try {
        const { latitude, longitude, id_turma } = req.body;

        if (!id_turma) {
            return res.status(400).json({ msg: "Você deve selecionar uma turma." });
        }

        const timezone = "America/Sao_Paulo"; // ← FALTAVA ISSO

        const agora = moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss");
        const hoje = moment().tz(timezone).format("YYYY-MM-DD");

        const calendario = await Calendario.findOne({
            where: {
                dt_aula: hoje,
                id_turma,
            }
        });

        if (!calendario) {
            return res.status(400).json({ msg: "Nenhum calendário encontrado para hoje." });
        }

        await Ponto.create({
            id_aluno: req.user.id,
            id_turma,
            id_calendario: calendario.pk_calendario,
            dt_entrada: agora,
            fl_is_on: true,
            tp_status: "pendente",
        });

        res.status(201).json({ msg: "Check-in registrado!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao registrar o check-in." });
    }
};





exports.fazerCheckout = async (req, res) => {
    try {
        const agora = new Date();

        const pontoAberto = await Ponto.findOne({
            where: {
                id_aluno: req.user.id,
                fl_is_on: true,
            },
            order: [["pk_ponto", "DESC"]],
        });

        if (!pontoAberto)
            return res.status(400).json({ msg: "Nenhum check-in ativo encontrado." });

        pontoAberto.dt_saida = agora;
        pontoAberto.fl_is_on = false;
        await pontoAberto.save();

        res.json({ msg: "Check-out registrado!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao registrar o check-out." });
    }
};


exports.adicionarPontoManual = async (req, res) => {
    try {
        const { dia, chegada, saida, id_turma } = req.body;

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
            id_aluno: req.user.id,
            id_turma,
            id_calendario: calendario.pk_calendario,
            dt_entrada: dt_entrada,
            dt_saida: dt_saida,
            tp_status: "pendente",
            fl_is_on: false
        });


        res.status(201).json({ msg: "Ponto manual adicionado com sucesso!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao adicionar o ponto manual." });
    }
};

exports.verCalendarioAluno = async (req, res) => {
    try {
        if (req.user.role !== "aluno")
            return res.status(403).json({ msg: "Acesso negado. Somente alunos podem visualizar." });

        const { id } = req.user;
        const { turmaId } = req.query;

        if (!turmaId) {
            return res.status(400).json({ msg: "É necessário informar a turmaId." });
        }

        const turma = await Turmas.findOne({
            where: { pk_turma: turmaId, fl_ativa: true },
            include: [
                {
                    model: User,
                    as: "alunos",
                    where: { pk_usuario: id },
                    attributes: ["pk_usuario"],
                    through: { attributes: [] },
                },
            ],
        });

        if (!turma) {
            return res.status(403).json({ msg: "Você não está matriculado nesta turma ou ela está inativa." });
        }

        const calendario = await Calendario.findAll({
            where: { id_turma: turmaId },
            order: [["dt_aula", "ASC"]],
            attributes: [
                ["pk_calendario", "id"],
                "id_turma",
                ["dt_aula", "data"],
                ["fl_tem_aula", "temAula"],
                [Sequelize.literal(`NULLIF(ds_aviso, '')`), "aviso"],
                "dt_criado_em",
                "hr_inicio",
                "hr_fim",
            ],
        });

        res.json(calendario);

    } catch (error) {
        console.error("Erro ao buscar calendário:", error);
        res.status(500).json({ msg: "Erro ao buscar calendário." });
    }
};


exports.verAvisos = async (req, res) => {
    const { turmaId } = req.query;

    if (!turmaId) {
        return res.status(400).json({ msg: "É necessário informar a turmaId." });
    }

    try {
        const dias = await Calendario.findAll({
            where: { id_turma: turmaId },
            attributes: ["pk_calendario", "dt_aula", "ds_aviso", "id_turma"],
        });

        const avisosFormatados = dias.map(dia => ({
            id: dia.pk_calendario,
            data: dia.dt_aula,   // já está no formato 'YYYY-MM-DD'
            aviso: dia.ds_aviso,
            id_turma: dia.id_turma
        }));

        res.json(avisosFormatados);
    } catch (error) {
        console.error("Erro ao buscar avisos:", error);
        res.status(500).json({ msg: "Erro ao buscar avisos" });
    }
};



exports.verPontosComAlunos = async (req, res) => {
    try {
        const { turno } = req.query;


        const pontosComAlunos = await Ponto.findAll({
            include: [
                {
                    model: User,
                    as: "aluno",
                    attributes: ["nome", "turma"]
                }
            ]
        });

        const horasPorAluno = {};

        pontosComAlunos.forEach((ponto) => {
            const aluno = ponto.aluno;

            if (!aluno || !ponto.entrada || !ponto.saida) return;

            const nome = aluno.nome;
            const turma = aluno.turma;

            // Se foi passado um turno e ele não bate com o do aluno, ignora
            if (turno && turma !== turno) return;

            if (!horasPorAluno[nome]) {
                horasPorAluno[nome] = {
                    horas: 0,
                    turma
                };
            }

            if (ponto.status === "aprovado") {
                const entrada = new Date(ponto.entrada);
                const saida = new Date(ponto.saida);
                const duracaoHoras = (saida - entrada) / (1000 * 60 * 60);
                horasPorAluno[nome].horas += duracaoHoras;
            }
        });

        res.json(horasPorAluno);
    } catch (error) {
        console.error("Erro ao calcular horas por aluno:", error);
        res.status(500).json({ msg: "Erro ao calcular horas por aluno." });
    }
};



exports.verAniversariantesDoMes = async (req, res) => {
    try {
        const { turmaId } = req.query;

        if (req.user.role !== "aluno" && req.user.role !== "professor") {
            return res.status(403).json({ msg: "Acesso negado." });
        }

        if (!turmaId) {
            return res.status(400).json({ msg: "É necessário informar a turmaId." });
        }

        const alunos = await User.findAll({
            include: [
                {
                    model: Turmas,
                    as: "turmas",
                    where: { pk_turma: turmaId }, // coluna correta
                    attributes: [],
                    through: { attributes: [] },
                },
            ],
            attributes: [
                ["pk_usuario", "id"],
                ["nm_usuario", "nome"],
                ["dt_nascimento", "nasc"]
            ],
            where: { tp_usuario: "aluno" },
        });

        res.json(alunos);
    } catch (error) {
        console.error("Erro ao buscar aniversariantes:", error);
        res.status(500).json({ msg: "Erro ao buscar aniversariantes." });
    }
};


// Função auxiliar
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

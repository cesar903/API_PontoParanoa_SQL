const Ponto = require("../../../point/models/Ponto");
const { Calendario, Turmas, User } = require("../../../associations/models/associations");

const moment = require("moment-timezone");
const { Op, Sequelize  } = require("sequelize");



exports.verPontos = async (req, res) => {
    try {
        if (req.user.role === "professor") {
            const { alunoId } = req.params;
            if (!alunoId) return res.status(400).json({ msg: "ID do aluno é necessário." });

            const pontos = await Ponto.findAll({ where: { alunoId } });
            return res.json(pontos);
        }

        const pontos = await Ponto.findAll({ where: { alunoId: req.user.id } });
        res.json(pontos);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao buscar os pontos.", error });
    }
};

exports.fazerCheckin = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        //Localizaçao super geeks
        //const ESCOLA_LATITUDE = -23.711746920183902
        //const ESCOLA_LONGITUDE = -46.54635611175074

        //Localizaçao paranoa
        //const ESCOLA_LATITUDE = -23.69825590739253
        //const ESCOLA_LONGITUDE = -46.59110882551491

        //Localizaçao casa 
        const ESCOLA_LATITUDE = -23.795757
        const ESCOLA_LONGITUDE = -46.548611

        const RAIO_PERMITIDO_METROS = 200;

        // if (!latitude || !longitude)
        //     return res.status(400).json({ msg: "Localização não fornecida." });

        // const distancia = calcularDistancia(latitude, longitude, ESCOLA_LATITUDE, ESCOLA_LONGITUDE);
        // if (distancia > RAIO_PERMITIDO_METROS)
        //     return res.status(403).json({ msg: "Check-in permitido apenas dentro da escola." });

        const agora = new Date();
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // const checkinExistente = await Ponto.findOne({
        //     where: {
        //         alunoId: req.user.id,
        //         entrada: { [Op.gte]: hoje },
        //     },
        // });

        // if (checkinExistente)
        //     return res.status(400).json({ msg: "Você já fez check-in hoje." });

        const aluno = await User.findByPk(req.user.id);
        if (!aluno || !aluno.turma)
            return res.status(400).json({ msg: "Turma do aluno não definida." });

        let horaInicio, minutoInicio, horaFim, minutoFim;
        const horaAtual = agora.getHours();
        const minutosAtuais = agora.getMinutes();

        // if (aluno.turma === "manha") {
        //     horaInicio = 11; minutoInicio = 0;
        //     horaFim = 23; minutoFim = 0;
        // } else if (aluno.turma === "tarde") {
        //     horaInicio = 16; minutoInicio = 30;
        //     horaFim = 17; minutoFim = 30;
        // } else {
        //     return res.status(400).json({ msg: "Turma inválida." });
        // }

        // const dentroDoHorario =
        //     (horaAtual > horaInicio || (horaAtual === horaInicio && minutosAtuais >= minutoInicio)) &&
        //     (horaAtual < horaFim || (horaAtual === horaFim && minutosAtuais <= minutoFim));

        // if (!dentroDoHorario)
        //     return res.status(403).json({ msg: "Check-in permitido apenas no horário correto." });

        await Ponto.create({
            alunoId: req.user.id,
            entrada: agora,
            status: "pendente",
            isOn: true,
            latitude,
            longitude
        });

        res.status(201).json({ msg: "Check-in registrado!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao registrar o check-in." });
    }
};

exports.fazerCheckout = async (req, res) => {
    try {
        const ponto = await Ponto.findOne({
            where: { alunoId: req.user.id, status: "pendente" },
            order: [["entrada", "DESC"]],
        });

        if (!ponto) return res.status(400).json({ msg: "Nenhum check-in pendente encontrado." });

        ponto.saida = new Date();
        ponto.status = "pendente";
        ponto.isOn = false;
        await ponto.save();

        res.status(200).json({ msg: "Check-out registrado!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao registrar o check-out." });
    }
};

exports.adicionarPontoManual = async (req, res) => {
    try {
        const { dia, chegada, saida } = req.body;

        if (!dia || !chegada || !saida)
            return res.status(400).json({ msg: "Por favor, preencha todos os campos." });

        const entrada = moment.tz(`${dia}T${chegada}:00`, "America/Sao_Paulo").toDate();
        const saidaFormatada = moment.tz(`${dia}T${saida}:00`, "America/Sao_Paulo").toDate();

        await Ponto.create({
            alunoId: req.user.id,
            entrada,
            saida: saidaFormatada,
            status: "pendente"
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

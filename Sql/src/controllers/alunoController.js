const Ponto = require("../models/Ponto");
const User = require("../models/User");
const Calendario = require("../models/Calendario")
const moment = require("moment-timezone");
const { Op } = require("sequelize");



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

        const calendario = await Calendario.findAll();
        res.json(calendario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar calendário." });
    }
};

exports.verAvisos = async (req, res) => {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const limite = new Date();
        limite.setDate(limite.getDate() + 10);
        limite.setHours(23, 59, 59, 999);

        const avisos = await Calendario.findAll({
            where: {
                data: { [Op.between]: [hoje, limite] },
                aviso: { [Op.ne]: "" },
            },
            order: [["data", "ASC"]],
        });

        const avisosCorrigidos = avisos.map(aviso => ({
            ...aviso.toJSON(),
            data: new Date(aviso.data).toISOString().split("T")[0]
        }));

        res.json(avisosCorrigidos);
    } catch (error) {
        console.error("Erro ao buscar avisos:", error);
        res.status(500).json({ msg: "Erro ao buscar avisos." });
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
        const agora = new Date();
        const mesAtual = agora.getMonth();

        const alunos = await User.findAll({
            where: {
                role: { [Op.in]: ["aluno", "professor"] },
                nasc: { [Op.ne]: null }
            }
        });

        const aniversariantes = alunos.filter(aluno => {
            const dataNasc = new Date(aluno.nasc);
            return dataNasc.getMonth() === mesAtual;
        });

        res.status(200).json(aniversariantes);
    } catch (error) {
        console.error("Erro ao buscar aniversariantes:", error);
        res.status(500).json({ msg: "Erro ao buscar aniversariantes do mês." });
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

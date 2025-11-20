const User = require("../models/User");
const Turmas = require("../../classes/models/Turmas");
const Endereco = require("../../address/models/address");
const ProfessorTipo = require("../teacher/models/professor");


exports.listarTurmasUsuario = async (req, res) => {
    try {
        const { role, id } = req.user;

        let turmas;

        if (role === "aluno") {
            turmas = await Turmas.findAll({
                include: [
                    {
                        model: User,
                        as: "alunos",
                        where: { id },
                        attributes: [],
                        through: { attributes: [] },
                    },
                ],
                attributes: ["id", "nome", "descricao", "ativa"],
            });
        } else if (role === "professor") {
            turmas = await Turmas.findAll({
                where: { professor_id: id },
                attributes: ["id", "nome", "descricao", "ativa"],
            });
        } else {
            return res.status(403).json({ msg: "Usuário sem permissão." });
        }

        return res.json(turmas);
    } catch (error) {
        console.error("Erro ao listar turmas do usuário:", error);
        res.status(500).json({ msg: "Erro ao listar turmas do usuário." });
    }
};



exports.usuarioCompleto = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await User.findOne({
            where: { pk_usuario: id },
            attributes: [
                "pk_usuario",
                "nm_usuario",
                "ds_email",
                "nr_cpf",
                "dt_nascimento",
                "tp_usuario"
            ],
            include: [
                {
                    model: Endereco,
                    as: "endereco",
                },
                {
                    model: Turmas,
                    as: "turmas", 
                    through: { attributes: [] }
                },
                {
                    model: Turmas,
                    as: "turmasMinistradas", 
                    through: { attributes: [] }
                },
                {
                    model: ProfessorTipo,
                    as: "tipoProfessor",
                }
            ]
        });

        if (!usuario) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        const dadosPuros = usuario.get({ plain: true });
        res.json(dadosPuros);

    } catch (error) {
        console.error("Erro usuarioCompleto:", error);
        res.status(500).json({ msg: "Erro ao buscar usuário", error });
    }
};



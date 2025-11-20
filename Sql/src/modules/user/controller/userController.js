const bcrypt = require("bcryptjs");
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



exports.updateSenha = async (req, res) => {

    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        const storedHash = user.ds_senha_hash;

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        const isMatch = await bcrypt.compare(currentPassword, storedHash);

        if (!isMatch) {
            return res.status(400).json({ msg: "A senha atual está incorreta. Tente novamente." });
        }

        const salt = await bcrypt.genSalt(10);
        user.ds_senha_hash = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ msg: "Senha alterada com sucesso!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao alterar a senha." });
    }
}


exports.userData = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['senha'] }
        });

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao buscar informações do usuário" });
    }
}
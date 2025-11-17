const { User, Turmas } = require("../../associations/models/associations");

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
            where: { pk_usuario: id }, // coluna correta
            attributes: [],
            through: { attributes: [] },
          },
        ],
        attributes: [
          ["pk_turma", "id"],
          ["nm_turma", "nome"],
          ["ds_turma", "descricao"],
          ["fl_ativa", "ativa"]
        ],
      });
    } else if (role === "professor") {
      turmas = await Turmas.findAll({
        where: { id_professor: id }, // coluna correta
        attributes: [
          ["pk_turma", "id"],
          ["nm_turma", "nome"],
          ["ds_turma", "descricao"],
          ["fl_ativa", "ativa"]
        ],
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

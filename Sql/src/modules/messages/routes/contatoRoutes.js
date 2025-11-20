// src/routes/contatoRoutes.js
const express = require("express");
const router = express.Router();
const { User, Turmas } = require("../../associations/models/associations");
const authMiddleware = require("../../user/auth/middleware/authMiddleware");
const { Op } = require("sequelize");


router.get("/", authMiddleware, async (req, res) => {
  try {
    const meuRole = req.user.role;
    const meuId = req.user.id;

    let contatos;

    if (meuRole === "professor") {
      contatos = await User.findAll({
        where: { pk_usuario: { [Op.ne]: meuId } },
        attributes: ["pk_usuario", "nm_usuario", "ds_email"],
        include: [
          {
            model: Turmas,
            as: "turmas",
            attributes: ["pk_turma", "nm_turma"],
            through: { attributes: [] }
          }
        ]
      });
    } else {
      contatos = await User.findAll({
        where: { tp_usuario: "professor" },
        attributes: ["pk_usuario", "nm_usuario", "ds_email"]
      });
    }

    const formatado = contatos.map(u => ({
      id: u.pk_usuario,
      nome: u.nm_usuario,
      email: u.ds_email,
      turmas: u.turmas?.map(t => ({
        id: t.pk_turma,
        nome: t.nm_turma
      })) || []
    }));

    res.json(formatado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao buscar contatos" });
  }
});

module.exports = router;
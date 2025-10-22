// src/routes/contatoRoutes.js
const express = require("express");
const router = express.Router();
const { User } = require("../models/associations");
const authMiddleware = require("../middleware/authMiddleware");
const { Op } = require("sequelize"); // Importando o Op do Sequelize

router.get("/", authMiddleware, async (req, res) => {
  try {
    const meuRole = req.user.role; // 'professor' ou 'aluno'
    const meuId = req.user.id;

    let contatos;
    if (meuRole === "professor") {
      // professor vê todos os alunos + outros professores (menos ele mesmo)
      contatos = await User.findAll({
        where: {
          id: { [Op.ne]: meuId } // diferente do próprio id
        }
      });
    } else {
      // aluno vê todos os professores
      contatos = await User.findAll({ where: { role: "professor" } });
    }

    res.json(contatos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao buscar contatos" });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { Mensagem, User } = require("../models/associations");
const { Op } = require("sequelize");
const authMiddleware = require("../middleware/authMiddleware");

// Enviar mensagem
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { destinatarioId, conteudo } = req.body;
    const remetenteId = req.user.id;

    const mensagem = await Mensagem.create({
      remetenteId,
      destinatarioId,
      conteudo,
    });

    res.status(201).json(mensagem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao enviar mensagem" });
  }
});

// Listar mensagens entre dois usuários
router.get("/:usuarioId", authMiddleware, async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const meuId = req.user.id;

    const mensagens = await Mensagem.findAll({
      where: {
        [Op.or]: [
          { remetenteId: meuId, destinatarioId: usuarioId },
          { remetenteId: usuarioId, destinatarioId: meuId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.json(mensagens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro ao buscar mensagens" });
  }
});

module.exports = router;

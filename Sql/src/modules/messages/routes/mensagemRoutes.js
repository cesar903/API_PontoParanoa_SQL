const express = require("express");
const router = express.Router();
const { Mensagem, User } = require("../../associations/models/associations");
const { Op } = require("sequelize");
const authMiddleware = require("../../user/auth/middleware/authMiddleware");

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



router.put("/marcar-como-lidas/:remetenteId", authMiddleware, async (req, res) => {
  try {
    const meuId = req.user.id;
    const { remetenteId } = req.params;

    await Mensagem.update(
      { lida: true },
      {
        where: {
          remetenteId,
          destinatarioId: meuId,
          lida: false,
        },
      }
    );

    return res.json({ message: "Mensagens marcadas como lidas com sucesso" });
  } catch (error) {
    console.error("Erro ao marcar mensagens como lidas:", error);
    return res.status(500).json({ error: "Erro ao marcar mensagens como lidas" });
  }
});


router.get("/nao-lidas", authMiddleware, async (req, res) => {
  try {
    const meuId = req.user.id;

    // Busca todas mensagens não lidas destinadas a mim
    const mensagensNaoLidas = await Mensagem.findAll({
      where: {
        destinatarioId: meuId,
        lida: false,
      },
    });

    // Cria um contador por remetente
    const contador = {};
    mensagensNaoLidas.forEach((msg) => {
      contador[msg.remetenteId] = (contador[msg.remetenteId] || 0) + 1;
    });

    res.json({
      contador, 
      meuId,
    });
  } catch (error) {
    console.error("Erro ao buscar mensagens não lidas:", error);
    res.status(500).json({ msg: "Erro ao buscar mensagens não lidas" });
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

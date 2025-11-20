const express = require("express");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../auth/middleware/authMiddleware");
const userController = require("../controller/userController");
const User = require("../models/User");
const Turmas = require("../../classes/models/Turmas");

const router = express.Router();



router.get("/usuarios/:id", authMiddleware, userController.usuarioCompleto);
router.get("/listarTurmas", authMiddleware, userController.listarTurmasUsuario);

router.get("/", authMiddleware, async (req, res) => {
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
});


router.put("/password", authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.senha);
        if (!isMatch) {
            return res.status(400).json({ msg: "A senha atual está incorreta. Tente novamente." });
        }

        const salt = await bcrypt.genSalt(10);
        user.senha = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: "Senha alterada com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Erro ao alterar a senha." });
    }
});

module.exports = router;

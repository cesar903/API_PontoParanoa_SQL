const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
require("dotenv").config();

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "Credenciais inválidas!" });

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) return res.status(400).json({ msg: "Credenciais inválidas!" });

    const token = jwt.sign(
      { id: user.id, role: user.role, nome: user.nome },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: {
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ msg: "Erro no servidor" });
  }
};

// Configurando o transporte para envio de e-mail
const transporter = nodemailer.createTransport({
  host: "smtp.datawake.com.br",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const solicitarRecuperacaoSenha = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ msg: "Usuário não encontrado" });

    const token = crypto.randomBytes(20).toString("hex");
    const expira = Date.now() + 3600000;

    await user.update({
      resetPasswordToken: token,
      resetPasswordExpires: expira,
    });

    const resetUrl = `http://escolinha.paranoa.com.br/resetar-senha/${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Recuperação de Senha",
      text: `Você solicitou a recuperação de senha. Clique no link para redefinir: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: "E-mail de recuperação enviado" });
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    res.status(500).json({ msg: "Erro ao processar a recuperação de senha" });
  }
};

const redefinirSenha = async (req, res) => {
  const { token } = req.params;
  const { novaSenha } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [require("sequelize").Op.gt]: Date.now() },
      },
    });

    if (!user) return res.status(400).json({ msg: "Token inválido ou expirado" });

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await user.update({
      senha: senhaHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.status(200).json({ msg: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    res.status(500).json({ msg: "Erro ao redefinir a senha" });
  }
};

module.exports = {
  login,
  solicitarRecuperacaoSenha,
  redefinirSenha,
};

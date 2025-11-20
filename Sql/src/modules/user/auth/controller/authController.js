const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User, Turmas } = require("../../../associations/models/associations");

require("dotenv").config();

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({
      where: { ds_email: email },
      include: [
        {
          model: Turmas,
          as: "turmas",
          attributes: ["pk_turma", "nm_turma", "ds_turma", "fl_ativa"],
          through: { attributes: [] },
        }
      ],
    });

    if (!user) {
      return res.status(400).json({ msg: "Credenciais inválidas!" });
    }

    const senhaValida = await bcrypt.compare(senha, user.ds_senha_hash);
    if (!senhaValida) {
      return res.status(400).json({ msg: "Credenciais inválidas!" });
    }

    const token = jwt.sign(
      {
        id: user.pk_usuario,
        role: user.tp_usuario,
        nome: user.nm_usuario,
        professor_tipo: user.id_professor_tipo,
        role: user.tp_usuario,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    const payload = {
      token,
      user: {
        id: user.pk_usuario,
        nome: user.nm_usuario,
        email: user.ds_email,
        role: user.tp_usuario,
        professor_tipo: user.id_professor_tipo,
        turmas: user.id_professor_tipo
      },
    };
  
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ msg: "Erro no servidor." });
  }
};






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
    if (!user)
      return res.status(404).json({ msg: "Usuário não encontrado" });

    const token = crypto.randomBytes(20).toString("hex");
    const expira = Date.now() + 3600000; // 1 hora

    await user.update({
      resetPasswordToken: token,
      resetPasswordExpires: expira,
    });

    const resetUrl = `http://escolinha.paranoa.com.br/resetar-senha/${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Recuperação de Senha - Escolinha Paranoá",
      html: `
        <h3>Recuperação de Senha</h3>
        <p>Olá, <strong>${user.nome}</strong>!</p>
        <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
        <p>Este link expira em 1 hora.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ msg: "E-mail de recuperação enviado com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    return res.status(500).json({ msg: "Erro ao processar a recuperação de senha." });
  }
};


const redefinirSenha = async (req, res) => {
  const { token } = req.params;
  const { novaSenha } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user)
      return res.status(400).json({ msg: "Token inválido ou expirado." });

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await user.update({
      senha: senhaHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return res.status(200).json({ msg: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return res.status(500).json({ msg: "Erro ao redefinir a senha." });
  }
};

module.exports = {
  login,
  solicitarRecuperacaoSenha,
  redefinirSenha,
};
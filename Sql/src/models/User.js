const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true // Indica que o campo 'email' deve ser único no banco de dados
  },
  senha: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING, allowNull: false },
  nasc: { type: DataTypes.DATEONLY },
  endereco: { type: DataTypes.STRING, allowNull: false },
  turma: { type: DataTypes.ENUM("manha", "tarde"), allowNull: false },
  role: { type: DataTypes.ENUM("aluno", "professor"), allowNull: false },
  resetPasswordToken: DataTypes.STRING,
  resetPasswordExpires: DataTypes.DATE,
}, {
  tableName: "users",
  timestamps: false,
  // Garantir que o índice único seja aplicado corretamente
  indexes: [
    {
      unique: true, // Garante que 'email' seja único
      fields: ['email'] // Define que o campo de email terá índice único
    }
  ]
});

module.exports = User;

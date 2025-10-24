const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true 
  },
  senha: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING, allowNull: false },
  nasc: { type: DataTypes.DATEONLY },
  endereco: { type: DataTypes.STRING, allowNull: false },
  turma: { type: DataTypes.ENUM("manha", "tarde", "karate"), allowNull: false },
  role: { type: DataTypes.ENUM("aluno", "professor"), allowNull: false },
  karate: { type: DataTypes.BOOLEAN, defaultValue: false },
  resetPasswordToken: DataTypes.STRING,
  resetPasswordExpires: DataTypes.DATE,
}, {
  tableName: "users",
  timestamps: false,
});

module.exports = User;

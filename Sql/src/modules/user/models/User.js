const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
    },
    nasc: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    endereco: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("aluno", "professor"),
      allowNull: false,
    },
    professor_tipo: {
      type: DataTypes.ENUM("tecnologia", "karate", "ginastica", "todos"),
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: false,
    underscored: true,
  }
);

module.exports = User;

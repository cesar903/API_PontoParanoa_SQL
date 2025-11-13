// models/alunosTurmas.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const AlunosTurmas = sequelize.define(
  "AlunosTurmas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    aluno_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    turma_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "alunos_turmas",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["aluno_id", "turma_id"],
        name: "uk_aluno_turma",
      },
    ],
  }
);

module.exports = AlunosTurmas;

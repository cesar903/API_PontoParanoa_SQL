// models/alunosTurmas.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const AlunosTurmas = sequelize.define(
  "AlunosTurmas",
  {
    pk_aluno_turma: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_aluno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "pk_usuario",
      },
      onDelete: "CASCADE",
    },


    id_turma: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "turmas",
        key: "pk_turma", 
      },
      onDelete: "CASCADE",
    },

    dt_criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tb_usuario_turma",
    timestamps: false,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["id_aluno", "id_turma"],
        name: "uk_aluno_turma",
      },
    ],
  }
);

module.exports = AlunosTurmas;

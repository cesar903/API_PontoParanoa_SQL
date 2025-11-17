// models/Turmas.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Turmas = sequelize.define(
  "Turmas",
  {
    pk_turma: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nm_turma: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    ds_turma: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    id_professor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "pk_usuario",
      },
      onDelete: "SET NULL",
    },


    fl_ativa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    dt_criado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    dt_atualizado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "turmas",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Turmas;

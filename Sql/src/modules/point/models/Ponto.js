// models/Ponto.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Ponto = sequelize.define(
  "Ponto",
  {
    pk_ponto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "pk_ponto",
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

    id_calendario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "calendarios",
        key: "pk_calendario",
      },
      onDelete: "CASCADE",
    },


    id_turma: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "id_turma",
      references: {
        model: "turmas",
        key: "pk_turma",
      },
      onDelete: "SET NULL",
    },

    dt_entrada: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "dt_entrada",
    },

    dt_saida: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "dt_saida",
    },

    fl_is_on: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "fl_is_on",
    },

    tp_status: {
      type: DataTypes.ENUM("pendente", "aprovado", "rejeitado"),
      allowNull: false,
      defaultValue: "pendente",
      field: "tp_status",
    },

    dt_criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "dt_criado_em",
    },

    dt_atualizado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "dt_atualizado_em",
    },
  },
  {
    tableName: "tb_ponto",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Ponto;

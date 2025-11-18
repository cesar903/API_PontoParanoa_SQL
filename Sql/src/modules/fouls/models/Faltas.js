// models/Faltas.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Faltas = sequelize.define(
  "Faltas",
  {
    pk_falta: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "pk_falta"
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


    ds_motivo: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      field: "ds_motivo",
    },

    fl_gerada_auto: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "fl_gerada_auto",
    },

    dt_criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "dt_criado_em",
    },
  },
  {
    tableName: "tb_faltas_justificadas",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Faltas;

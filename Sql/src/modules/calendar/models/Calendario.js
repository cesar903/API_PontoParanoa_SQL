// models/Calendario.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Calendario = sequelize.define(
  "Calendario",
  {
    pk_calendario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    id_turma: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    dt_aula: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    fl_tem_aula: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    ds_aviso: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    dt_criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    hr_inicio: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    hr_fim: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    tableName: "tb_calendario",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Calendario;

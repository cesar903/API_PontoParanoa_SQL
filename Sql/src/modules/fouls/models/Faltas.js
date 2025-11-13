// models/Faltas.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Faltas = sequelize.define(
  "Faltas",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    aluno_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    calendario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "calendarios",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    justificada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    motivo: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
  },
  {
    tableName: "faltas",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Faltas;

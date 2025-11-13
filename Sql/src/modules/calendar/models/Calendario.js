// models/Calendario.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Calendario = sequelize.define(
  "Calendario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    turma_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    temAula: {
      type: DataTypes.BOOLEAN,
      field: "tem_aula",
      allowNull: false,
      defaultValue: true,
    },
    aviso: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "calendarios",
    timestamps: false, 
    underscored: true,
  }
);

module.exports = Calendario;

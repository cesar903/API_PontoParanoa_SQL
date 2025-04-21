const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Calendario = sequelize.define("Calendario", {
  data: { type: DataTypes.DATEONLY, allowNull: false },
  temAula: { type: DataTypes.BOOLEAN, allowNull: false },
  aviso: { type: DataTypes.STRING, defaultValue: "" }
}, {
  tableName: "calendarios",
  timestamps: false
});

module.exports = Calendario;

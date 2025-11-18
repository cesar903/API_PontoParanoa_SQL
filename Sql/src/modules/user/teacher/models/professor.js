const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../../config/db");

const ProfessorTipo = sequelize.define(
  "ProfessorTipo",
  {
    pk_professor_tipo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nm_professor_tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    ds_descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    dt_criado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    dt_atualizado_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "tb_professor_tipo",
    timestamps: false,
    underscored: true,
  }
);

module.exports = ProfessorTipo;

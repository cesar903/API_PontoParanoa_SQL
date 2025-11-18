// models/Mensagem.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Mensagem = sequelize.define(
  "Mensagem",
  {
    pk_mensagem: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "pk_mensagem",
    },

    ds_conteudo: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "ds_conteudo",
    },

    fl_lida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "fl_lida",
    },

    id_remetente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "pk_usuario",
      },
      onDelete: "CASCADE",
    },

    id_destinatario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "pk_usuario",
      },
      onDelete: "CASCADE",
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
    tableName: "tb_mensagem",
    timestamps: false,
    underscored: true,
  }
);

module.exports = Mensagem;

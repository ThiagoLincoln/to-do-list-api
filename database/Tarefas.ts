const { DataTypes } = require("sequelize");
const connection = require("./database"); // Importando a conexão com o banco

const Tarefa = connection.define("Tarefa", {
  task: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

module.exports = Tarefa;

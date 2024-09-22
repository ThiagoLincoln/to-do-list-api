const Sequelize = require("sequelize")

const connection = new Sequelize("to-do-list", "root", "2409", {
    host: "localhost",
    dialect:  "mysql",
})

module.exports = connection
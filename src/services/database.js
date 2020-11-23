const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "conpair",
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql"
  }
);

module.exports = sequelize;

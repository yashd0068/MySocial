const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT || 3306, // fallback to 3306 if not set
        logging: false,
    }
);

// Test the connection
sequelize
    .authenticate()
    .then(() => console.log("SQL connected successfully"))
    .catch((err) => console.log("Error connecting to MySQL:", err.message));

module.exports = sequelize;
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: 5432, // PostgreSQL port
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    }
);

// Test the connection
sequelize
    .authenticate()
    .then(() => console.log("✅ PostgreSQL connected successfully"))
    .catch((err) => console.error("❌ PostgreSQL connection error:", err));

module.exports = sequelize;

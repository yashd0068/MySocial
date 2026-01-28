const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

// Check if DATABASE_URL exists (for production on Render)
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            connectTimeout: 30000, // 30 seconds timeout
            keepAlive: true
        },
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000, // 30 seconds to acquire connection
            idle: 10000
        },
        retry: {
            max: 3, // Retry connection 3 times
            timeout: 30000
        }
    });
    console.log("📊 Using DATABASE_URL connection");
} else {

    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,



        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 6543,
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
    console.log("💻 Using individual DB variables");
}

// Test the connection
// sequelize
//     .authenticate()
//     .then(() => console.log("✅ PostgreSQL connected successfully"))
//     .catch((err) => console.error("❌ PostgreSQL connection error:", err));

// module.exports = sequelize;
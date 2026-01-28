const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

// Check if DATABASE_URL exists (for production on Render)
if (process.env.DATABASE_URL) {
    // Use the full connection string from Supabase for production
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
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
sequelize
    .authenticate()
    .then(() => console.log("✅ PostgreSQL connected successfully"))
    .catch((err) => console.error("❌ PostgreSQL connection error:", err));

module.exports = sequelize;
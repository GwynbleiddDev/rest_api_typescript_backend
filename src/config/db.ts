import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv';
import Product from "../models/Product.model";
import colors from 'colors';
dotenv.config()

// Create Sequelize instance with improved configuration
const db = new Sequelize(process.env.DB_URL!, {
  models: [__dirname + '/../models/**/*'],
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    // Add connection timeout settings
    connectTimeout: 30000 // 30 seconds
  },
  // Add retry logic via Sequelize pool settings
  pool: {
    max: 5, // Maximum number of connections in pool
    min: 0, // Minimum number of connections in pool
    acquire: 60000, // Maximum time (ms) to acquire a connection before throwing an error
    idle: 10000, // Maximum time (ms) a connection can be idle before being released
    // Add more retries for connection acquisition
    evict: 1000, // Run cleanup every 1000ms to evict dead connections
  },
  retry: {
    // Add better error handling for connection errors
    match: [
      /ECONNRESET/,
      /ETIMEDOUT/,
      /PROTOCOL_CONNECTION_LOST/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /Connection terminated unexpectedly/
    ],
    max: 5 // Maximum number of retry attempts
  }
});

// Add models to database instance
db.addModels([Product]);

// Function to connect to the database with retry logic
export async function connectWithRetry(maxRetries = 5) {
  let retries = 0;
  let connected = false;
  
  while (!connected && retries < maxRetries) {
    try {
      // Attempt to connect
      await db.authenticate();
      console.log(colors.blue.bold('Database connection established successfully'));
      connected = true;
      return true;
    } catch (error) {
      retries++;
      // Calculate exponential backoff delay: 2^retry * 1000ms (1s, 2s, 4s, 8s, 16s)
      const delay = Math.min(Math.pow(2, retries) * 1000, 30000); // Cap at 30 seconds
      
      console.log(colors.yellow(`Connection attempt ${retries}/${maxRetries} failed. Retrying in ${delay/1000} seconds...`));
      console.error(colors.red(`Error: ${error.message}`));
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  if (!connected) {
    console.log(colors.red.bold('Failed to connect to database after maximum retry attempts'));
    return false;
  }
}

export default db

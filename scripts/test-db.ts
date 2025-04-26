import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv';
import colors from 'colors';

// Load environment variables
dotenv.config();

console.log('Database connection test script');
console.log('-------------------------------');
console.log(`Using DB_URL: ${process.env.DB_URL ? 'Found (value hidden for security)' : 'Not found!'}`);

// Create a Sequelize instance with the same configuration as the main app
const sequelize = new Sequelize(process.env.DB_URL!, {
  logging: console.log, // Enable detailed logging for debugging
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    // Add connection timeout settings
    connectTimeout: 30000 // 30 seconds
  }
});

async function testConnection() {
  try {
    console.log(colors.yellow('Testing database connection...'));
    await sequelize.authenticate();
    console.log(colors.green.bold('✓ Connection has been established successfully.'));
    
    // Try a simple query to test full connectivity
    console.log(colors.yellow('Testing query execution...'));
    const result = await sequelize.query('SELECT 1 AS test');
    console.log(colors.green.bold('✓ Query executed successfully.'));
    console.log('Query result:', result[0]);
    
    return true;
  } catch (error) {
    console.log(colors.red.bold('✗ Unable to connect to the database:'));
    console.error(colors.red('Error name:'), error.name);
    console.error(colors.red('Error message:'), error.message);
    console.error(colors.red('Error stack:'), error.stack);
    
    if (error.original) {
      console.error(colors.red('Original error:'), error.original);
    }
    
    // Check common issues
    if (error.message.includes('ECONNREFUSED')) {
      console.log(colors.yellow('\nPossible issues:'));
      console.log('- Database server might be down or not accepting connections');
      console.log('- Firewall might be blocking the connection');
      console.log('- Database URL might be incorrect');
    } else if (error.message.includes('ECONNRESET')) {
      console.log(colors.yellow('\nPossible issues:'));
      console.log('- Connection was reset by the server (common with cloud databases that go to sleep)');
      console.log('- Network connectivity issues');
      console.log('- SSL configuration issues');
    } else if (error.message.includes('timeout')) {
      console.log(colors.yellow('\nPossible issues:'));
      console.log('- Connection timeout (might be due to slow network or database server is busy)');
      console.log('- Database server might be unreachable');
    }
    
    return false;
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log(colors.green.bold('\nAll tests passed successfully!'));
      process.exit(0);
    } else {
      console.log(colors.red.bold('\nTests failed. Please check the error messages above.'));
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error during test execution:', err);
    process.exit(1);
  });


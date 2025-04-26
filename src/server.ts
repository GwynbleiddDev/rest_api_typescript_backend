import express from 'express'
import colors from 'colors'
import cors, { CorsOptions } from 'cors'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec, { swaggerUiOptions } from './config/swagger'
import router from './router'
import db, { connectWithRetry } from './config/db'

// Connect to database with retry logic
export async function connectDB() {
  try {
    console.log(colors.yellow.bold('Attempting to connect to database...'));
    
    // Use the retry logic to connect to the database
    const connected = await connectWithRetry(5);
    
    if (connected) {
      // Sync database models
      await db.sync();
      console.log(colors.green.bold('Database models synchronized successfully'));
    } else {
      console.log(colors.red.bold('Failed to connect to database after multiple attempts'));
      console.log(colors.yellow('API will start, but database functionality may be limited'));
    }
  } catch (error) {
    console.log(colors.red.bold('Error during database connection:'));
    console.error(colors.red(error.message));
    console.log(colors.yellow('API will start, but database functionality may be limited'));
  }
}

// Connect to database when server starts up
connectDB();


// Instancia de express
const server: express.Express = express()


// Permitir conexiones
const corsOptions : CorsOptions = {
  origin: function(origin, callback) {
    if(origin === process.env.FRONTEND_URL) {
      callback(null, true) // error: null, connection: true
    } else {
      callback(new Error('CORS Error'))
    }
  }
}
server.use(cors(corsOptions))


// Leer datos de formularios
server.use(express.json())

server.use(morgan('dev'))

server.use('/api/products', router)

// Docs
server.use( '/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions) )


export default server
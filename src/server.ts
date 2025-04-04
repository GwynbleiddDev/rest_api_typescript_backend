import express from 'express'
import colors from 'colors'
import cors, { CorsOptions } from 'cors'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec, { swaggerUiOptions } from './config/swagger'
import router from './router'
import db from './config/db'

// Conectar db
export async function connectDB() {
  try {
    await db.authenticate()
    db.sync()
    // console.log(colors.blue.bold('Conexion exitosa'))
  } catch (error) {
    // console.log(error)
    console.log(colors.red.bold('Hubo un error al conectar a la DB'))
  }
}
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
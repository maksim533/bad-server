import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import mongoSanitize from 'express-mongo-sanitize';
import { expressShield } from 'node-shield';
import { limiter } from './middlewares/rate-limiter'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const { ORIGIN_ALLOW } = process.env
const app = express()

app.use(cookieParser())

app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(limiter)


app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())

// app.options('*', cors())
app.use(expressShield({
  errorHandler: (shieldError, _req, res, _next) => res.status(400).json({ 
      error: 'Найдено невалидное значение',
      message: shieldError.message
    }),
}));
app.use(mongoSanitize({
  allowDots: false,
}));

app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()

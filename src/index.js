import Config from './Config.js'
import Err from './Modules/Service/ErrorService.js'

if (!Config) {
    console.error('Config not defined')
    process.exit()
}

/* Libraries */

import express from 'express'
import cookieParser from 'cookie-parser'

/* Routers */

import SpotifyRouter from './Modules/Router/SpotifyRouter.js'

/* Middlewares */

import CorsMiddleware from './Modules/Middleware/CorsMiddleware.js'
import ErrorMiddleware from './Modules/Middleware/ErrorMiddleware.js'

/* Settings */

let app = express()


app.disable('x-powered-by')
app.set('trust proxy', 'loopback')
app.use('/Assets', express.static('./src/Assets'))
app.set('views', './src/Modules/Views')
app.set('view engine', 'ejs')
app.use(express.json())
app.use(CorsMiddleware)
app.use(cookieParser())

/* HTTP Server Api */

app.all('/ping', (_req, res) => res.send({ response: { success: true } }))
app.use('/', SpotifyRouter)
app.use('*', (_req, _res, next) => next(new Err(404)))
app.use(ErrorMiddleware)

/* Starter */

const Start = _ => {
    try {
        app.listen(Config.SERVER_PORT, () => console.log(`HTTP Server started on ${Config.SERVER_PORT} port`))
    } catch (e) {
        console.error(e)
        process.exit()
    }
}

Start()

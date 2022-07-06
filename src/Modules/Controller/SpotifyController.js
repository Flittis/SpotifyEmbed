import Config from '../../Config.js'
import { MediaClass } from '../Class/MediaClass.js'

import Err from '../Service/ErrorService.js'
import SpotifyService from '../Service/SpotifyService.js'

let Spotify = new SpotifyService(Config.SPOTIFY)
let MediaTypes = {
    'track': 'tracks',
    'album': 'albums'
}

let SpotifyController = {
    auth: async (_, res, next) => {
        try {
            res.redirect(Spotify.getAuthLink())
        } catch (e) {
            console.error(e)
            next(e)
        }
    },
    callback: async (req, res, next) => {
        try {
            if (!req.query.code) return next(new Err(400, 'Code not defined'))

            let { access_token, refresh_token, id, name, image, uri } = await Spotify.completeAuth(req.query.code)

            res.cookie('access_token', access_token, { secure: true, sameSite: 'None', maxAge: 3600 * 1000 })
            res.cookie('refresh_token', refresh_token, { secure: true, sameSite: 'None', maxAge: 8760 * 3600000 })
            res.cookie('user', JSON.stringify({ id, name, image, uri }), { secure: true, sameSite: 'None', maxAge: 8760 * 3600000 })

            if (req.acceptHTML) res.set('Content-Type', 'text/html').render('Callback')
            else res.res({ success: true, id, uri, name, image })
        } catch (e) {
            console.error(e)
            next(e)
        }
    },
    user: async (req, res, next) => {   
        try {
            if (!req.cookies.refresh_token || !req.cookies.user) return next(new Err(401))

            let User = {}
            try {
                User = JSON.parse(req.cookies.user)
            } catch(e) {}

            res.res({ refresh_token: req.cookies.refresh_token, User })
        } catch (e) {
            if (e == 'Invalid session') {
                ['access_token', 'refresh_token', 'user'].forEach(el => res.clearCookie(el))
                return next(new Err(401))
            }
            if (e == 'invalid id') return next(new Err(404, 'Item not found'))

            console.error(e)
            next(e)
        }
    },
    open: async (req, res, next) => {   
        try {
            let { mediaType: type, id } = req.params
            if (!Object.keys(MediaTypes).includes(type)) return next(new Err(404))
            if (!req.cookies.refresh_token || !req.cookies.user) return res.set('Content-Type', 'text/html').render('Authorization')

            let Response = await Spotify.call(`${MediaTypes[type]}/${id}`, { refresh_token: req.cookies.refresh_token, access_token: req.cookies.access_token }), User = {}
            try {
                User = JSON.parse(req.cookies.user)
            } catch(e) {}

            if (!Response || !Response.id) return next(new Err(404))

            res.set('Content-Type', 'text/html').render('Media', { ...new MediaClass(Response), User })
        } catch (e) {
            if (e == 'Invalid session') {
                ['access_token', 'refresh_token', 'user'].forEach(el => res.clearCookie(el))
                return res.set('Content-Type', 'text/html').render('Authorization')
            }
            if (e == 'invalid id') return next(new Err(404, 'Item not found'))

            console.error(e)
            next(e)
        }
    },
    play: async (req, res, next) => {
        try {
            if (!req.cookies.refresh_token) return next(new Err(401))
            if (!req.query.context_uri && !req.query.uris) return next(new Err(400, 'Item to play not defined'))

            let Response = await Spotify.call('me/player/play', { method: 'PUT', refresh_token: req.cookies.refresh_token, access_token: req.cookies.access_token, body: req.query })

            res.res({ success: true })
        } catch (e) {
            if (e == 'Invalid session') {
                ['access_token', 'refresh_token', 'user'].forEach(el => res.clearCookie(el))
                return next(new Err(401))
            }
            if (e == 'invalid id') return next(new Err(404, 'Item not found'))

            console.error(e)
            next(e)
        }
    },
    queue: async (req, res, next) => {
        try {
            if (!req.cookies.refresh_token) return next(new Err(401))
            if (!req.query.uri) return next(new Err(400, 'Item to queue not defined'))

            let Response = await Spotify.call('me/player/queue', { method: 'POST', refresh_token: req.cookies.refresh_token, access_token: req.cookies.access_token, params: { uri: req.query.uri } })

            res.res({ success: true })
        } catch (e) {
            if (e == 'Invalid session') {
                ['access_token', 'refresh_token', 'user'].forEach(el => res.clearCookie(el))
                return next(new Err(401))
            }
            if (e == 'invalid id') return next(new Err(404, 'Item not found'))

            console.error(e)
            next(e)
        }
    }
}

export default SpotifyController
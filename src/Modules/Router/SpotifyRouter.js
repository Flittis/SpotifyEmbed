import { Router } from 'express'

import SpotifyController from '../Controller/SpotifyController.js'

let router = new Router()

router.get('/api/auth', SpotifyController.auth)
router.get('/api/callback', SpotifyController.callback)
router.get('/api/user', SpotifyController.user)
router.post('/api/play', SpotifyController.play)
router.post('/api/queue', SpotifyController.queue)
router.get('/:mediaType/:id', SpotifyController.open)

export default router
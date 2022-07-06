import axios from 'axios'

export default class SpotifyService {
    client_id
    client_secret
    redirect_uri
    scopes

    constructor({ client_id, client_secret, redirect_uri, scopes }) {
        if (!client_id || !client_secret || !redirect_uri || !scopes) throw 'Options not defined'

        this.client_id = client_id
        this.client_secret = client_secret
        this.redirect_uri = redirect_uri
        this.scopes = scopes
    }

    getAuthLink = _ => {
        let Params = {
            client_id: this.client_id,
            redirect_uri: this.redirect_uri,
            response_type: 'code',
            scope: encodeURIComponent(this.scopes),
        }

        return `https://accounts.spotify.com/authorize?` + new URLSearchParams(Params).toString()
    }

    completeAuth = code => {
        if(!code) throw 'Code not defined'

        return new Promise(async (resolve, reject) => {
            try {
                let Options = {
                    method: 'POST',
                    baseURL: 'https://accounts.spotify.com/api/',
                    params: {
                        grant_type: 'authorization_code',
                        redirect_uri: this.redirect_uri,
                        code
                    },
                    headers: {
                        Authorization: 'Basic ' + (Buffer.from(this.client_id + ':' + this.client_secret).toString('base64'))
                    }
                }

                let { access_token, refresh_token } = await this.call('token', Options)
                let { id, display_name, images, uri } = await this.call('me', { access_token })

                resolve({ access_token, refresh_token, id, uri, name: display_name, image: images[0]?.url })
            } catch (e) {
                reject(e || 'Unknown error')
            }
        })
    }

    refreshToken = refresh_token => {
        if(!refresh_token) throw 'Refresh token not defined'

        return new Promise(async (resolve, reject) => {
            try {
                let Response = await this.call('token', { 
                    method: 'POST',
                    baseURL: 'https://accounts.spotify.com/api/',
                    params: {
                        grant_type: 'refresh_token',
                        refresh_token
                    },
                    headers: { 
                        'Authorization': 'Basic ' + (Buffer.from(this.client_id + ':' + this.client_secret).toString('base64')) 
                    },
                })

                resolve(Response)
            } catch (e) {
                reject(e || 'Unknown error')
            }
        })
    }

    call(method, options = {}) {
        if (!method) return reject('Bad request')
        
        return new Promise(async (resolve, reject) => {
            try {
                if (!options.access_token && options.refresh_token) {
                    let { access_token } = await this.refreshToken(options.refresh_token)

                    options.access_token = access_token
                }

                let Response = (await axios({
                    method: options.method || 'GET',
                    url: (options.baseURL || 'https://api.spotify.com/v1/') + method,
                    params: options?.params || null,
                    headers: options.headers || { Authorization: 'Bearer ' + options.access_token }
                }))

                resolve(Response.data)
            } catch(e) {
                if (e?.response?.data?.description != 'The access token expired') return reject(e?.response?.data?.error_description || e?.response?.data?.error?.message || e || 'Unknown error') 
                if (!options.refresh_token) return reject('Invalid session')
                if (options._isRetry === true) return reject('Invalid session')

                this.refreshToken(options.refresh_token)
                    .then(res => this.call(method, { _isRetry: true, ...options }).then(resolve).catch(reject))
                    .catch(_ => reject('Invalid session'))
            }
        })
    }
}
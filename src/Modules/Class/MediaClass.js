export class MediaClass {
    type         // String - type of item ['track', 'album']
    currentItem  // Track - current track
    allItems     // [Track] - list of tracks (only for albums)

    constructor(_Media) {
        this.type = _Media.type
        
        if (this.type == 'track') {
            this.currentItem = new Track(_Media)
        } else if (this.type == 'album') {
            this.allItems = _Media.tracks.items.map(_Track => new Track(_Track, null))
            this.currentItem = this.allItems[0]
            this.currentItem.album = new Album(_Media)
        }
    }
}

class Track {
    id          // String - track id
    name        // String - track name
    uri         // String - track uri
    url         // String - track url
    explicit    // Boolean - is track explicit
    album       // Album - track album
    duration    // Number - track duration in seconds
    artists     // [Artist] - array of artists

    constructor(_Track, album) {
        this.id = _Track.id
        this.name = _Track.name
        this.uri = _Track.uri
        this.url = _Track.url
        this.explicit = _Track.explicit
        this.artists = _Track.artists.map(_Artist => new Artist(_Artist))
        this.duration = _Track.duration_ms

        if (album === null) this.album = undefined
        else this.album = album || (_Track.album ? new Album(_Track.album) : undefined)
    }
}

class Album {
    id          // String - album id
    name        // String - album name
    uri         // String - album uri
    url         // String - album url
    image       // String - album image cover

    constructor(_Album) {
        this.id = _Album.id
        this.name = _Album.name
        this.uri = _Album.uri
        this.url = _Album.external_urls.spotify
        this.image = _Album.images[0].url
    }
}

class Artist {
    id          // String - artist id
    name        // String - artist name
    uri         // String - artist uri
    url         // String - artist url

    constructor(_Artist) {
        this.id = _Artist.id
        this.name = _Artist.name
        this.uri = _Artist.uri
        this.url = _Artist.external_urls.spotify
    }
}
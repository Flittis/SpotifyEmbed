window.Spotify = {
    queue: async function(el, uri) {
        try {
            await fetch('/api/queue', { 
                method: 'POST', 
                body: JSON.stringify({ uri }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
            el.classList.add('isInQueue')
        } catch(e) {
            console.error(e)
        }
    }
}

window.onload = () => {
    fetch('/api/user')
        .then(res => console.log(res.json()))
        .catch(err => console.error(err))
}
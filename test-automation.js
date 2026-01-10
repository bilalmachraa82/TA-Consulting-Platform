fetch('http://localhost:3001/api/scraper/browser-automation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        portal: 'portugal2030',
        options: { interceptApi: true }
    })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
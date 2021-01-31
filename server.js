const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const port = 3000

let hours = []
let motos = 8

app.use('/public', express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'))
})

io.on('connection', (socket) => {
    console.log('a user connected')

    socket.emit('main', {
        motos,
        hours
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })

    socket.on('take-hour', (data) => {
        let findUsedHourIndex = hours.findIndex(el=> el.hour === data.hour)

        if (findUsedHourIndex === -1) { // si la hora no esta ocupada
            if (motos > 0) { // si existen motociclistas
                hours.push({
                    user: data.user,
                    hour: data.hour
                })

                motos -= 1
            }
        } else {
            if (hours[findUsedHourIndex].user === data.user) {
                hours.splice(findUsedHourIndex, 1)

                motos += 1
            }
        }


        io.sockets.emit('main', {
            motos,
            hours
        })
    })
})

http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
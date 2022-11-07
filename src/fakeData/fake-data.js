const random  = require('random')
const mqtt = require('mqtt')
const client  = mqtt.connect('ws://broker.emqx.io:8083/mqtt')



client.on('connect', function () {
    console.log("connectged")
  client.subscribe('hyped.temperature', function (err) {
    console.error(err)
    if (!err) {
      client.publish('hyped.temperature', generateRandomTemperature())
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer

  console.log(message.toString())

  client.end()
})

let generateRandomTemperature =  function(){
    let randomTemperature = Math.round(random.float((min = 0),(max = 100)))
    return String(randomTemperature)
}
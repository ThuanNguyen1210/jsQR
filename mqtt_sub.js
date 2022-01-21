const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://test.mosquitto.org", {
  clientId: "user2",
  clean: true
});

client.on("connect", () => console.log("Connected!"))
client.on("error", () => console.log("Error!"));

client.subscribe("topic123", {qos: 1});

client.on("message", (topic, message) => {
  console.log("message: ",JSON.parse(message.toString()));
  // console.log("topic: ", topic);
  // client.publish("topic789", "this is test message");
})

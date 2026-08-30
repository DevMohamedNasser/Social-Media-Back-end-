// const client = io("http://127.0.0.1:3000/admin");

// client.on("connect", () => {
//   console.log("Server establish connection successfully");
// });

// client.emit("sayHi", "[Hello Socket.io]. From Front-end to Back-end", (ack) => {
//   // ack = acknowledge
//   console.log(ack);
// });

const client = io("http://127.0.0.1:3000");

client.on("connect", () => {
  console.log("Server establish connection successfully");
});

client.on("product", (data, callback) => {
  console.log(data);
  callback("I've received ur message");
});

// اللي بيlisten بياخد 2 arguments (data اللي جياله, callback يرد بيها تروح هناك كـ acknowledge)
// اللي بيemit اول argument اسم الevent التاني الداتا اللي بيبعتها التالت function فيها acknowledge جايه م برا

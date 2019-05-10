const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");

const util = require('util');
const exec = util.promisify(require('child_process').exec);


//event listener
io.on("connection", socket => {
  console.log("New client is connected!");

  socket.on("file", data => {
    fs.writeFile("../Compilers/input.txt", data, function(err) {
        if (err) {
          return console.log(err);
        }
      
        async function ls() {
          await exec('cd ../Compilers && Flex lex.l && bison -d parseryacc.y && gcc -o testFromServer parseryacc.tab.c');
          const { stdout, stderr } = await exec('cd ../Compilers  && ./testFromServer < input.txt')
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);

          socket.emit("output" , {correct : stdout , false : stderr});
        }
        ls();
    });
  });
});

//starting the server
http.listen(port, () => {
  console.log("hello from the server! " + port);
});







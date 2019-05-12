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

          // fs.unlink("../Compilers/file.txt",(err) => {
          //   console.log(err);
          // })

          fs.writeFile('../Compilers/file.txt', '', function(){console.log('done')})

          await exec('cd ../Compilers && Flex lex.l && bison -d ParserYacc.y && gcc -o testFromServer.exe ParserYacc.tab.c');
          const { stdout, stderr } = await exec('cd ../Compilers  && testFromServer.exe < input.txt')
          
          //console.log('stdout:', stdout);
          //console.log('stderr:', stderr);

          socket.emit("output" , {correct : stdout , false : stderr});
        }
        ls().then(()=>{
        //   fs.readFile("../Compilers/file.txt", 'utf8', function(err, contents) {
        //     //console.log(contents);
        //     try{
        //     socket.emit("file" , contents);

        //     }catch(err){
        //       console.log(err);
        //     }
        // });

        try{
          var contents = fs.readFileSync('../Compilers/file.txt', 'utf8');
          socket.emit("file" , contents);
        }catch(err){
          console.log(err)
        }
    
        });
    });
  });
});

//starting the server
http.listen(port, () => {
  console.log("hello from the server! " + port);
});







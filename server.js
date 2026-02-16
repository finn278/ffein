const express = require('express'); 
const app = express(); 
const http = require('http').createServer(app); 
const io = require('socket.io')(http); 

app.use(express.static('public')); 

const games = {}

io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`);

    socket.on("joinGame", (room) => {
        const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

        if (roomSize >= 2){
            socket.emit("roomFull");
            return;
        }
        else if (roomSize == 0){
            socket.player = "X";
            socket.room = room;
            socket.join(room);
            socket.emit("waiting");
            console.log(`${socket.id} has joined room ${room}`);

            games[room] = {
                board: ["", "", "", "", "", "", "", "", ""],
                currentPlayer: "X",
                running: false
            };
        }
        else{
            socket.player = "O";
            socket.room = room;
            socket.join(room);
            io.to(room).emit("startGame");
            games[room]["running"] = true;
            
            console.log(`${socket.id} has joined room ${room}`);
            console.log(`game started in room ${room}`);
        }
    });

    socket.on("makeMove", (moveIndex) => {
        const currentPlayer = games[socket.room]["currentPlayer"];
        const board = games[socket.room]["board"];
        const running = games[socket.room]["running"];

        if ((socket.player == currentPlayer) && (board[moveIndex] == "") && (running == true)){
            io.to(socket.room).emit("updateBoard", {
                player: currentPlayer,
                index: moveIndex
            });

            board[moveIndex] = currentPlayer;
            if (currentPlayer == "X") {games[socket.room]["currentPlayer"] = "O";}
            else {games[socket.room]["currentPlayer"] = "X";}

            console.log(`room ${socket.room}: ${socket.id} put an ${currentPlayer} in cell ${moveIndex}`);

            checkWin(board, currentPlayer, socket.room);
        }
    });

    socket.on("disconnect", () => {
        console.log(`user disconnected: ${socket.id}`);
        
        if (!socket.room) return;

        io.to(socket.room).emit("roomClosed");
        delete games[socket.room];
    });
});

function checkWin(board, player, room){
    let gameWon = false;

    const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
    ];

    for (let i=0; i<winConditions.length; i++){
        const condition = winConditions[i];

        const cellA = board[condition[0]];
        const cellB = board[condition[1]];
        const cellC = board[condition[2]];

        if ((cellA == cellB) && (cellB == cellC) && (cellC == player)){
            gameWon = true;
        }
    }

    if (gameWon == true){
        io.to(room).emit("gameWon", player);
        games[room]["running"] = false;
    }
    else if (!board.includes("")){
        io.to(room).emit("draw");
        games[room]["running"] = false;
    }
}

http.listen(process.env.PORT || 2000, () => {
    console.log(`server listening on port ${2000}`);
})
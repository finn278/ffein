const socket = io();

const loginDiv = document.querySelector("#login");
const waitingDiv = document.querySelector("#waiting");
const gameContainerDiv = document.querySelector("#gameContainer");

const cells = document.querySelectorAll(".cell");
const statusMessage = document.querySelector("#statusMessage");

function enterRoom() {
    const roomCode = document.querySelector('#roomCode');
    socket.emit("joinGame", roomCode.value);
    roomCode.value = "";
}

socket.on("roomFull", () => {
    alert("that room is full!");
});
socket.on("waiting", () => {
    loginDiv.style.display = "none";
    waitingDiv.style.display = "block";
})
socket.on("startGame", () => {
    loginDiv.style.display = "none";
    waitingDiv.style.display = "none";
    gameContainerDiv.style.display = "block";

    cells.forEach(cell => cell.innerHTML = "");
    cells.forEach(cell => cell.addEventListener("click", cellClicked));
    statusMessage.innerHTML = "X's turn";
});

function cellClicked(){
    cellIndex = this.getAttribute("cellIndex");
    socket.emit("makeMove", cellIndex);
}

socket.on("updateBoard", gameState => {
    player = gameState["player"];
    index = gameState["index"];

    cells[index].innerHTML = player;

    if (player == "X") {statusMessage.innerHTML = "O's turn";}
    else {statusMessage.innerHTML = "X's turn";}
});

socket.on("gameWon", winner => {
    statusMessage.innerHTML = `${winner} wins!!`;
});
socket.on("draw", () => {
    statusMessage.innerHTML = `its a draw!!`;
});

socket.on("roomClosed", () => {
    cells.forEach(cell => cell.removeEventListener("click", cellClicked));
    statusMessage.innerHTML = "other player disconnected :(";
});
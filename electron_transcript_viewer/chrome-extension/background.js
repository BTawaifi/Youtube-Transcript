
let socket = new WebSocket("ws://localhost:8080");

socket.onopen = function(e) {
    console.log("Connection established");
};

socket.onmessage = function(event) {
    console.log("Data received: ", event.data);
};

socket.onclose = function(event) {
    console.log("Connection closed");
};

socket.onerror = function(error) {
    console.error("WebSocket error: ", error);
};

// Example of using sendData (replace with your actual data sending logic)
function sendData(data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
    }
}

// You can call sendData with actual data from your extension's logic
// sendData("Your transcript data here");
            
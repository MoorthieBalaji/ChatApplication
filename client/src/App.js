import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

function App() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (room) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/messages/${room}`);
          setMessages(res.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
      socket.emit("join_room", room);
    }
  }, [room]);

  useEffect(() => {
    const receiveMessage = (newMessage) => {
      console.log("Received new message:", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.off("receive_message");
    socket.on("receive_message", receiveMessage);

    return () => {
      socket.off("receive_message", receiveMessage);
    };
  }, []);

  const sendMessage = async () => {
    if (message.trim() && room.trim()) {
      const newMessage = { room, username, message };

      console.log("Sending message:", newMessage);
      await axios.post("http://localhost:5000/messages", newMessage);

      setMessage("");
    }
  };

  return (
    <div className="container">
      <h4 className="tit mt-5">Chat Application</h4>
      <div className="row content mt-5">
        <div className="col-6 in mt-5">
          <input
            className="in"
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <input
            className="in"
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="in"
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="mt-2 btn" onClick={sendMessage}>
            Send
          </button>
        </div>

        <div className="messages col-6 mt-5">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.username}:</strong> {msg.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

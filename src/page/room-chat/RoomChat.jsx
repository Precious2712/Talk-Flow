import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "@/use-context/useContext";

const RoomChat = () => {
    const { roomId } = useParams();
    const { socket } = useAppContext();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    // join room
    useEffect(() => {
        if (!socket) return;
        socket.emit("join-room", { roomId });
    }, [socket, roomId]);

    // listen for room messages
    useEffect(() => {
        if (!socket) return;

        socket.on("room-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.off("room-message");
    }, [socket]);

    const sendMessage = () => {
        socket.emit("room-message", { roomId, message });
        setMessage("");
    };

    return (
        <div className="p-4">
            <div className="h-[70vh] overflow-y-auto">
                {messages.map((msg) => (
                    <p key={msg._id}>
                        <b>{msg.senderName}:</b> {msg.message}
                    </p>
                ))}
            </div>

            <div className="flex mt-2">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border flex-1 p-2"
                />
                <button onClick={sendMessage} className="ml-2 px-4 bg-black text-white">
                    Send
                </button>
            </div>
        </div>
    );
};

export default RoomChat;

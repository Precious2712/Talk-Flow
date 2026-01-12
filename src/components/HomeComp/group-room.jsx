import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ChevronLeft, Menu, Plus, Users } from "lucide-react";
import { useAppContext } from "@/use-context/useContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const GroupChatRoom = () => {
    const { pendingMember, addMemberToRoom, socket } = useAppContext();

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomMessages, setRoomMessages] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [text, setText] = useState("");

    const messagesContainerRef = useRef(null);


    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [roomMessages]);


    useEffect(() => {
        const fetchRooms = async () => {
            const stored = JSON.parse(localStorage.getItem("auth"));
            if (!stored) return;

            const res = await axios.get(
                "https://realtime-chathub.onrender.com/api/v1/rooms",
                {
                    headers: {
                        Authorization: `Bearer ${stored.user.token}`
                    }
                }
            );

            setRooms(res.data.rooms);
        };

        fetchRooms();
    }, []);

    
    useEffect(() => {
        if (!selectedRoom || !socket) return;

        const stored = JSON.parse(localStorage.getItem("auth"));
        if (!stored) return;

        const loadMessages = async () => {
            const res = await axios.get(
                `https://realtime-chathub.onrender.com/api/v1/messages/room/${selectedRoom._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${stored.user.token}`
                    }
                }
            );

            setRoomMessages(res.data.messages);
        };

        loadMessages();

        socket.emit("join-room", { roomId: selectedRoom._id });

        socket.on("room-message", (msg) => {
            setRoomMessages(prev => [...prev, msg]);
        });

        return () => socket.off("room-message");
    }, [selectedRoom, socket]);


    const sendMessage = () => {
        if (!text.trim() || !selectedRoom || !socket) return;

        socket.emit("room-message", {
            roomId: selectedRoom._id,
            message: text
        });

        setText("");
    };


    const getRoomInitials = (roomName) => {
        if (!roomName) return "";
        const words = roomName.split(" ");
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return roomName.substring(0, 2).toUpperCase();
    };

    const handleAdd = (room) => {
        if (!pendingMember) {
            toast.error("No user selected");
            return;
        }

        if (room) {
            toast.success('User added to group');
        }

        addMemberToRoom(pendingMember, room);
    };


    return (
        <div className="bg-gray-900 text-white min-h-screen">

            {/* ================= MOBILE ================= */}
            <div className="lg:hidden relative h-screen flex flex-col">

                {/* Header */}
                <div className="h-14 bg-gray-800 flex justify-between items-center gap-4 px-4 z-30 shrink-0 border-b border-gray-700">
                    <div className="flex gap-2.5">
                        <Menu onClick={() => setShowSidebar(true)} className="cursor-pointer" />

                        {selectedRoom ? (
                            <div className="flex flex-col">
                                <span className="font-semibold leading-tight">
                                    {selectedRoom.roomName}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Users size={12} />
                                    {selectedRoom.members.length} members
                                </span>
                            </div>
                        ) : (
                            <span className="font-semibold">Groups</span>
                        )}
                    </div>

                    <Link to='/chat-room' className="">
                        <ArrowLeft />
                    </Link>
                </div>

                {/* Sidebar */}
                {showSidebar && (
                    <div className="fixed inset-0 z-40 flex">
                        <div className="bg-gray-800 w-64 h-full p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-semibold">Rooms</h2>
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="text-gray-400 hover:text-white text-lg"
                                >
                                    ✕
                                </button>
                            </div>
                            {rooms.map(room => (
                                <div
                                    key={room._id}
                                    onClick={() => {
                                        setSelectedRoom(room);
                                        setShowSidebar(false);
                                    }}
                                    className="p-3 rounded-lg cursor-pointer hover:bg-gray-700 mb-2 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                        {getRoomInitials(room.roomName)}
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {room.roomName}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {room.members.length} members
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            className="flex-1 bg-black/60"
                            onClick={() => setShowSidebar(false)}
                        />
                    </div>
                )}

                {/* Messages Area */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                >
                    {!selectedRoom ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 px-4">
                            <div className="text-3xl mb-4">💬</div>
                            <p className="text-center text-lg font-medium mb-2">Welcome to Group Chat</p>
                            <p className="text-center text-gray-400">Select a room from the menu to start chatting</p>
                        </div>
                    ) : roomMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <div className="text-2xl mb-2">👋</div>
                                <p>Start a conversation in {selectedRoom?.roomName}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {roomMessages.map(msg => (
                                <div key={msg._id} className="bg-gray-700 p-3 rounded-xl max-w-[85%] mx-auto">
                                    <div className="text-xs text-gray-300 mb-1">
                                        {msg.senderName}
                                    </div>
                                    {msg.message}
                                </div>
                            ))}
                        </>
                    )}
                </div>

                
                {selectedRoom && (
                    <div className="bg-gray-800 p-3 border-t border-gray-700 flex gap-2 shrink-0">
                        <input
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Type a message…"
                            className="flex-1 rounded-lg px-4 py-3 text-black"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-purple-600 px-5 rounded-lg"
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>

            {/* ================= DESKTOP ================= */}
            <div className="hidden lg:flex h-screen">

               
                <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 fixed left-0 top-0 bottom-0">
                    <div className="h-14 flex gap-2.5 items-center px-4 font-semibold border-b border-gray-700 shrink-0">
                        <Link to='/chat-room' className="border border-amber-800 rounded-full flex items-center justify-center bg-gray-800">
                            <ChevronLeft className="" />
                        </Link>
                        <span>Rooms</span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-3">
                        {rooms.map(room => (
                            <div
                                key={room._id}
                                onClick={() => setSelectedRoom(room)}
                                className={`relative flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-700 ${selectedRoom?._id === room._id ? 'bg-gray-700' : ''
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                    {getRoomInitials(room.roomName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{room.roomName}</div>
                                    <small className="text-gray-400 text-xs">
                                        {room.members.length} members
                                    </small>
                                </div>
                                <div className="flex items-center border rounded-full bg-gray-700">
                                    <Plus
                                        onClick={() => {
                                            handleAdd(room);
                                        }}
                                        className="w-3 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-gray-900 ml-72" style={{ width: "calc(100% - 288px)" }}>

                    {/* Chat Header */}
                    {selectedRoom && (
                        <div className="h-14 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                    {getRoomInitials(selectedRoom.roomName)}
                                </div>
                                <div>
                                    <div className="font-semibold text-lg">
                                        {selectedRoom.roomName}
                                    </div>
                                    <small className="text-gray-400">
                                        {selectedRoom.members.length} members
                                    </small>
                                </div>
                            </div>
                            <div className="text-gray-400">
                                {roomMessages.length} {roomMessages.length === 1 ? 'message' : 'messages'}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex justify-center overflow-hidden">
                        <div className="w-160 max-w-full flex flex-col">

                            
                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                            >
                                {!selectedRoom ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 px-4">
                                        <div className="text-5xl mb-6">💬</div>
                                        <p className="text-center text-2xl font-medium mb-3">Welcome to Group Chat</p>
                                        <p className="text-center text-gray-400 text-lg">Select a room from the sidebar to start chatting</p>
                                    </div>
                                ) : roomMessages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <div className="text-4xl mb-4">👋</div>
                                            <p className="text-xl mb-2">Start a conversation in {selectedRoom?.roomName}</p>
                                            <p className="text-gray-400">Type your first message below</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {roomMessages.map(msg => (
                                            <div
                                                key={msg._id}
                                                className="bg-gray-700 p-4 rounded-xl"
                                                style={{
                                                    maxWidth: 'calc(100% - 60px)'
                                                }}
                                            >
                                                <div className="text-xs text-gray-300 mb-1">
                                                    {msg.senderName}
                                                </div>
                                                {msg.message}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Input Area - Only show when room is selected */}
                            {selectedRoom && (
                                <div className="bg-gray-800 p-2 text-white border-t border-gray-700 shrink-0 w-full">
                                    <div className="flex gap-3">
                                        <input
                                            value={text}
                                            onChange={e => setText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            className="flex-1 rounded-lg px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder={`Message in ${selectedRoom?.roomName}`}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            className="bg-purple-600 hover:bg-purple-700 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!text.trim()}
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupChatRoom;
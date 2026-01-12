import CreateRoomModal from "@/components/HomeComp/create-room-modal";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/use-context/useContext";
import {  Menu, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {  useNavigate } from "react-router-dom";

export const ChatRoom = () => {
    const [show, setShow] = useState(false);
    const [text, setText] = useState("");

    const navigate = useNavigate();

    const bottomRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const {
        client,
        selectedUser,
        messages,
        typingUser,
        presence,
        handleselectUser,
        sendMessage,
        sendTyping,
        currentUser,
        unreadCounts,
        isCreatingRoom,
        setRoomMembers,
        setIsCreatingRoom,
        setPendingMember
    } = useAppContext();

    
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, typingUser]);

    const handleSend = () => {
        if (!selectedUser) return;
        sendMessage(text);
        setText("");
    };

    const handleLogout = () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('user');
        navigate('/');
    }

    const handleLGroupChat = () => {
        navigate('/group-chat');
    }

    const statusText = presence[selectedUser?._id] || "offline";

    const initials = (u) => `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase();


    return (
        <div className="bg-gray-900 text-white min-h-screen">

            {/* ================= MOBILE ================= */}
            <div className="lg:hidden relative h-screen flex flex-col">

                <div className="h-14 bg-gray-800 flex items-center justify-between px-4 z-30 shrink-0 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <Menu onClick={() => setShow(true)} className="cursor-pointer" />
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-4 whitespace-nowrap min-w-max px-2">
                            <div className="flex gap-4">
                                <span
                                    onClick={handleLogout}
                                    className="cursor-pointer text-white px-3 py-2 rounded-md
                           hover:text-purple-400 hover:bg-white/10
                           transition-colors duration-200"
                                >
                                    Logout
                                </span>

                                <span
                                    onClick={() => setIsCreatingRoom(true)}
                                    className="cursor-pointer text-white px-3 py-2 rounded-md
                           hover:text-purple-400 hover:bg-white/10
                           transition-colors duration-200"
                                >
                                    Create-room
                                </span>

                                <span
                                    onClick={handleLGroupChat}
                                    className="cursor-pointer text-white px-3 py-2 rounded-md
                           hover:text-purple-400 hover:bg-white/10
                           transition-colors duration-200"
                                >
                                    Group-chat
                                </span>
                            </div>

                            {selectedUser && (
                                <small className="text-gray-400 text-sm">
                                    {statusText}
                                </small>
                            )}
                        </div>
                    </div>

                </div>

                {show && (
                    <div className="fixed inset-0 z-40 flex">
                        <div
                            className="bg-gray-800 w-64 h-full p-4 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-semibold">Users</h2>
                                <button
                                    onClick={() => setShow(false)}
                                    className="text-gray-400 hover:text-white text-lg"
                                >
                                    ✕
                                </button>
                            </div>
                            {client.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => {
                                        handleselectUser(user);
                                        setShow(false);
                                    }}
                                    className={`flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer mb-1 ${selectedUser?._id === user._id ? 'bg-gray-700' : ''
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                        {initials(user)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{user.firstName} {user.lastName}</div>
                                        <small className="text-gray-400 text-xs">
                                            {presence[user._id] || "offline"}
                                        </small>
                                    </div>
                                    {unreadCounts[user._id] > 0 && (
                                        <span className="bg-purple-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-medium">
                                            {unreadCounts[user._id]}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div
                            className="flex-1 bg-black/60"
                            onClick={() => setShow(false)}
                        />
                    </div>
                )}


                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-3 "
                >
                    {!selectedUser ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 px-4">
                            <div className="text-3xl mb-4">💬</div>
                            <p className="text-center text-lg font-medium mb-2">Welcome to Chat</p>
                            <p className="text-center text-gray-400">Select a user from the menu to start chatting</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <div className="text-2xl mb-2">👋</div>
                                <p>Start a conversation with {selectedUser?.firstName}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, i) => (
                                <div
                                    key={msg._id || i}
                                    className={`p-3 rounded-xl max-w-[85%] mx-auto ${msg.sender === currentUser?._id
                                        ? "bg-purple-600 ml-auto"
                                        : "bg-gray-700"
                                        }`}
                                >
                                    <div className="wrap-break-words">{msg.message}</div>
                                    {msg.seen && msg.sender === currentUser?._id && (
                                        <div className="text-xs text-gray-300 text-right mt-1">
                                            seen
                                        </div>
                                    )}
                                </div>
                            ))}
                            {typingUser === selectedUser?._id && (
                                <div className="text-sm text-gray-400 italic">
                                    {selectedUser?.firstName} is typing...
                                </div>
                            )}
                        </>
                    )}
                    <div ref={bottomRef} />
                </div>

                {selectedUser && (
                    <div className="bg-gray-800 p-3 flex gap-2 shrink-0 border-t border-gray-700">
                        <input
                            value={text}
                            onChange={e => {
                                setText(e.target.value);
                                sendTyping();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="flex-1 rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder={`Message ${selectedUser?.firstName}`}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!text.trim()}
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>

            {/* ================= DESKTOP ================= */}
            <div className="hidden lg:flex h-screen">

                {/* Sidebar */}
                <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
                    <div className="h-14 flex items-center px-4 font-semibold border-b border-gray-700 shrink-0">
                        <span>Users</span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-3">
                        {client.map(user => (
                            <div
                                key={user._id}
                                onClick={() => handleselectUser(user)}
                                className={`relative flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-700 ${selectedUser?._id === user._id ? 'bg-gray-700' : ''
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                        {initials(user)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${presence[user._id] === 'online' ? 'bg-green-500' : 'bg-gray-500'
                                        }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{user.firstName} {user.lastName}</div>
                                    <small className="text-gray-400 text-xs cursor-pointer">
                                        {presence[user._id] || "offline"}
                                    </small>
                                </div>
                                <div className="flex items-center border rounded-full bg-gray-700">
                                    <Plus
                                        onClick={() => {
                                            setPendingMember(user);
                                            navigate("/group-chat");
                                        }}
                                        className="w-3 h-3" />
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-gray-900">
                    {/* Chat Header */}
                    <div className="h-14 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700 shrink-0">
                        <div className="flex items-center gap-3">
                            {selectedUser && (
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                        {initials(selectedUser)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${statusText === 'online' ? 'bg-green-500' : 'bg-gray-500'
                                        }`} />
                                </div>
                            )}
                            <div>
                                <div className="font-semibold text-lg">
                                    {selectedUser?.firstName || "Select a user"}
                                </div>
                                <small className="text-gray-400">{statusText}</small>
                            </div>
                        </div>
                        <div className="text-gray-400">
                            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleLogout}
                                className="
            px-4 py-2 rounded-md cursor-pointer
            bg-gray-800 text-gray-200
            hover:bg-red-600 hover:text-white
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-all duration-200
        "
                            >
                                Logout
                            </Button>

                            <Button
                                onClick={() => setIsCreatingRoom(true)}
                                className="
            px-4 py-2 rounded-md cursor-pointer
            bg-gray-800 text-gray-200
            hover:bg-purple-600 hover:text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-all duration-200
        "
                            >
                                Create-room
                            </Button>

                            <Button
                                onClick={handleLGroupChat}
                                className="
            px-4 py-2 rounded-md cursor-pointer
            bg-gray-800 text-gray-200
            hover:bg-blue-600 hover:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
            transition-all duration-200
        "
                            >
                                Group-chat
                            </Button>
                        </div>

                    </div>

                    <div className="flex-1 flex justify-center overflow-hidden">
                        <div className="w-160 max-w-full flex flex-col">

                            {/* Messages Container */}
                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide"
                            >
                                {!selectedUser ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 px-4">
                                        <div className="text-5xl mb-6">💬</div>
                                        <p className="text-center text-2xl font-medium mb-3">Welcome to Chat</p>
                                        <p className="text-center text-gray-400 text-lg">Select a user from the sidebar to start chatting</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <div className="text-4xl mb-4">👋</div>
                                            <p className="text-xl mb-2">Start a conversation with {selectedUser?.firstName}</p>
                                            <p className="text-gray-400">Type your first message below</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg, i) => (
                                            <div
                                                key={msg._id || i}
                                                className={`p-4 rounded-xl ${msg.sender === currentUser?._id
                                                    ? "bg-purple-600 ml-auto"
                                                    : "bg-gray-700"
                                                    }`}
                                                style={{
                                                    maxWidth: msg.sender === currentUser?._id
                                                        ? 'calc(100% - 60px)'
                                                        : 'calc(100% - 60px)'
                                                }}
                                            >
                                                <div className="wrap-break-words">{msg.message}</div>
                                                {msg.seen && msg.sender === currentUser?._id && (
                                                    <div className="text-xs text-gray-300 text-right mt-1">
                                                        seen
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {typingUser === selectedUser?._id && (
                                            <div className="text-sm text-gray-400 italic">
                                                {selectedUser?.firstName} is typing...
                                            </div>
                                        )}
                                        <div ref={bottomRef} />
                                    </>
                                )}
                            </div>

                            {/* Input Area - Only show when user is selected */}
                            {selectedUser && (
                                <div className="bg-gray-800 p-2 border-t border-gray-700 shrink-0">
                                    <div className="flex gap-3">
                                        <input
                                            value={text}
                                            onChange={e => {
                                                setText(e.target.value);
                                                sendTyping();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            className="flex-1 rounded-lg px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder={`Message ${selectedUser?.firstName}`}
                                        />
                                        <button
                                            onClick={handleSend}
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

                {isCreatingRoom && (
                    <CreateRoomModal
                        onClose={() => {
                            setIsCreatingRoom(false);
                            setRoomMembers([]);
                        }}
                    />
                )}

            </div>
        </div>
    );
};

export default ChatRoom;
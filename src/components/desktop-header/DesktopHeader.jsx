import React from 'react'



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
    roomMembers,
    isCreatingRoom,
    setRoomMembers,
    setIsCreatingRoom
} = useAppContext();

// Auto-scroll to bottom when new messages arrive
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

const toggleRoomMember = (user) => {
    const exists = roomMembers.find(m => m.memberId === user._id);

    if (exists) {
        setRoomMembers(prev =>
            prev.filter(m => m.memberId !== user._id)
        );
    } else {
        setRoomMembers(prev => [
            ...prev,
            {
                memberId: user._id,
                memberName: user.firstName
            }
        ]);
    }
};


const statusText = presence[selectedUser?._id] || "offline";

const initials = (u) =>
    `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase();


export const DesktopHeader = () => {

    const [show, setShow] = useState(false);
    const [text, setText] = useState("");

    const bottomRef = useRef(null);
    const messagesContainerRef = useRef(null);


    return (
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
                                <small className="text-gray-400 text-xs">
                                    {presence[user._id] || "offline"}
                                </small>
                            </div>
                            {unreadCounts[user._id] > 0 && (
                                <span className="bg-purple-600 text-white text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-medium">
                                    {unreadCounts[user._id]}
                                </span>
                            )}


                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area - FIXED WIDTH CENTERED CONTAINER */}
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
                        <Button>Logout</Button>
                        <Button onClick={() => setIsCreatingRoom(true)}>
                            Create-room
                        </Button>

                    </div>
                </div>

                {/* Main Content Container - Centered with fixed width */}
                <div className="flex-1 flex justify-center overflow-hidden">
                    {/* Fixed Width Chat Container (like WhatsApp Web - 640px) */}
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
                                            // Set fixed max widths for messages (like standard chat apps)
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
                            <div className="bg-gray-800 p-4 border-t border-gray-700 shrink-0">
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
                                        className="flex-1 rounded-lg px-5 py-3 text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
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
    )
}

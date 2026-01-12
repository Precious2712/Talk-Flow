import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const socketRef = useRef(null);
    const typingTimeout = useRef(null);
    const selectedUserRef = useRef(null);

    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [roomMembers, setRoomMembers] = useState([]);
    const [pendingMember, setPendingMember] = useState(null);


    const [client, setClient] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [typingUser, setTypingUser] = useState(null);
    const [presence, setPresence] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});

    
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

   
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("auth"));
        if (!stored) return;

        const socket = io("https://realtime-chathub.onrender.com", {
            auth: { token: stored.user.token }
        });

        socketRef.current = socket;

        
        socket.on("private-message", msg => {
            const senderId = msg.from;
            const activeUser = selectedUserRef.current;

            setMessages(prev => {
                const exists = prev.some(m => m._id === msg._id);
                if (exists) return prev;

                if (activeUser && activeUser._id === senderId) {
                    socket.emit("message-seen", {
                        messageId: msg._id,
                        to: senderId
                    });
                    return [...prev, msg];
                }

             
                setUnreadCounts(prevUnread => ({
                    ...prevUnread,
                    [senderId]: (prevUnread[senderId] || 0) + 1
                }));

                return prev;
            });
        });

        
        socket.on("typing", ({ from }) => {
            setTypingUser(from);
        });

        socket.on("stop-typing", () => {
            setTypingUser(null);
        });

        
        socket.on("message-seen", ({ messageId }) => {
            setMessages(prev =>
                prev.map(m =>
                    m._id === messageId ? { ...m, seen: true } : m
                )
            );
        });

       
        socket.on("presence-update", ({ userId, status }) => {
            setPresence(prev => ({ ...prev, [userId]: status }));
        });

        socket.on("users", (users) => {
            const initialUnreadCounts = {};
            users.forEach(user => {
                initialUnreadCounts[user._id] = 0;
            });
            setUnreadCounts(initialUnreadCounts);
        });

        return () => socket.disconnect();
    }, []);

    
    const users = async () => {
        const res = await axios.get("https://realtime-chathub.onrender.com/api/v1/get-users");
        setClient(res.data.getUser);

        
        const initialUnreadCounts = {};
        res.data.getUser.forEach(user => {
            initialUnreadCounts[user._id] = 0;
        });
        setUnreadCounts(initialUnreadCounts);
    };

    const checkCurrentUser = async () => {
        const stored = JSON.parse(localStorage.getItem("auth"));
        if (!stored) return;

        const res = await axios.get(
            "https://realtime-chathub.onrender.com/api/v1/get-current-user",
            {
                headers: {
                    Authorization: `Bearer ${stored.user.token}`
                }
            }
        );

        setCurrentUser(res.data);
    };

    
    const handleselectUser = async (user) => {
        setSelectedUser(user);
        setMessages([]);

        
        setUnreadCounts(prev => ({
            ...prev,
            [user._id]: 0
        }));

        const stored = JSON.parse(localStorage.getItem("auth"));

        const res = await axios.get(
            `https://realtime-chathub.onrender.com/api/v1/messages/private/${user._id}`,
            {
                headers: {
                    Authorization: `Bearer ${stored.user.token}`
                }
            }
        );

        setMessages(res.data);

        
        res.data.forEach(msg => {
            if (!msg.seen && msg.sender === user._id) {
                socketRef.current.emit("message-seen", {
                    messageId: msg._id,
                    to: user._id
                });
            }
        });
    };

    
    const sendTyping = () => {
        if (!selectedUser) return;

        socketRef.current.emit("typing", { to: selectedUser._id });

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current.emit("stop-typing", { to: selectedUser._id });
        }, 800);
    };

    
    const sendMessage = (text) => {
        if (!text.trim() || !selectedUser || !currentUser) return;

        const tempMessage = {
            _id: Date.now(),
            message: text,
            sender: currentUser._id,
            receiver: selectedUser._id,
            seen: false,
            createdAt: new Date()
        };

        
        setMessages(prev => [...prev, tempMessage]);

        socketRef.current.emit("private-message", {
            toUserId: selectedUser._id,
            message: text
        });
    };

    const addMemberToRoom = (user, room) => {
        console.log(`User - ${user} has been added to room ${room}`);
        
        if (!socketRef.current) return;

        if (!user?._id || !room?._id) {
            console.error("Invalid user or room", { user, room });
            return;
        }

        socketRef.current.emit("add-member-to-room", {
            roomId: room._id,
            memberId: user._id
        });
    };

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("member-added", () => {
            setPendingMember(null);
        });

        return () => {
            socketRef.current.off("member-added");
        };
    }, []);



    useEffect(() => {
        users();
        checkCurrentUser();
    }, []);



    return (
        <AppContext.Provider
            value={{
                socket: socketRef.current,
                pendingMember,
                client,
                selectedUser,
                addMemberToRoom,
                roomMembers,
                setRoomMembers,
                isCreatingRoom,
                setIsCreatingRoom,
                messages,
                currentUser,
                typingUser,
                presence,
                unreadCounts,
                handleselectUser,
                sendMessage,
                sendTyping,
                setPendingMember,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
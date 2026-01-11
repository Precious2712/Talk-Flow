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

    /* ================= KEEP REF IN SYNC ================= */
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    /* ================= SOCKET INIT ================= */
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("auth"));
        if (!stored) return;

        const socket = io("http://localhost:3000", {
            auth: { token: stored.user.token }
        });

        socketRef.current = socket;

        /* ---------- PRIVATE MESSAGE ---------- */
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

                // Update unread count for this user
                setUnreadCounts(prevUnread => ({
                    ...prevUnread,
                    [senderId]: (prevUnread[senderId] || 0) + 1
                }));

                return prev;
            });
        });

        /* ---------- TYPING ---------- */
        socket.on("typing", ({ from }) => {
            setTypingUser(from);
        });

        socket.on("stop-typing", () => {
            setTypingUser(null);
        });

        /* ---------- SEEN CONFIRMATION ---------- */
        socket.on("message-seen", ({ messageId }) => {
            setMessages(prev =>
                prev.map(m =>
                    m._id === messageId ? { ...m, seen: true } : m
                )
            );
        });

        /* ---------- PRESENCE ---------- */
        socket.on("presence-update", ({ userId, status }) => {
            setPresence(prev => ({ ...prev, [userId]: status }));
        });

        // Initialize unread counts when users load
        socket.on("users", (users) => {
            const initialUnreadCounts = {};
            users.forEach(user => {
                initialUnreadCounts[user._id] = 0;
            });
            setUnreadCounts(initialUnreadCounts);
        });

        return () => socket.disconnect();
    }, []);

    /* ================= USERS ================= */
    const users = async () => {
        const res = await axios.get("http://localhost:3000/api/v1/get-users");
        setClient(res.data.getUser);

        // Initialize unread counts for all users
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
            "http://localhost:3000/api/v1/get-current-user",
            {
                headers: {
                    Authorization: `Bearer ${stored.user.token}`
                }
            }
        );

        setCurrentUser(res.data);
    };

    /* ================= SELECT USER ================= */
    const handleselectUser = async (user) => {
        setSelectedUser(user);
        setMessages([]);

        // Clear unread badge for this user
        setUnreadCounts(prev => ({
            ...prev,
            [user._id]: 0
        }));

        const stored = JSON.parse(localStorage.getItem("auth"));

        const res = await axios.get(
            `http://localhost:3000/api/v1/messages/private/${user._id}`,
            {
                headers: {
                    Authorization: `Bearer ${stored.user.token}`
                }
            }
        );

        setMessages(res.data);

        // mark fetched messages as seen
        res.data.forEach(msg => {
            if (!msg.seen && msg.sender === user._id) {
                socketRef.current.emit("message-seen", {
                    messageId: msg._id,
                    to: user._id
                });
            }
        });
    };

    /* ================= TYPING ================= */
    const sendTyping = () => {
        if (!selectedUser) return;

        socketRef.current.emit("typing", { to: selectedUser._id });

        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current.emit("stop-typing", { to: selectedUser._id });
        }, 800);
    };

    /* ================= SEND MESSAGE ================= */
    const sendMessage = (text) => {
        if (!text.trim() || !selectedUser || !currentUser) return;

        const tempMessage = {
            _id: Date.now(), // temporary ID
            message: text,
            sender: currentUser._id,
            receiver: selectedUser._id,
            seen: false,
            createdAt: new Date()
        };

        // 🔥 ADD MESSAGE IMMEDIATELY
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
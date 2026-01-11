import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import NotFound from "@/page/NotFound";
import Home from "@/page";
import SignupPage from "@/page/auth/signup/Signup";
import LoginPage from "@/page/auth/login/LoginPage";
import { ChatRoom } from "@/page/auth/chat-room/ChatRoom";
import RoomChat from "@/page/room-chat/RoomChat";
import Group from "@/page/group-room/Group";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <NotFound />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: '/signup',
                element: <SignupPage />
            },
            {
                path: 'login',
                element: <LoginPage />
            },
            {
                path: 'chat-room',
                element: <ChatRoom />
            },
            {
                path: '/room',
                element: <RoomChat />
            },
            {
                path: '/group-chat',
                element: <Group />
            },
            
        ],
    },
]);

import { useState } from "react";
import { useAppContext } from "@/use-context/useContext";
import { toast } from "react-toastify";

const CreateRoomModal = ({ onClose }) => {
    const [roomName, setRoomName] = useState("");
    const { socket } = useAppContext();

    const handleCreate = () => {
        if (!roomName.trim()) return;

        socket.emit("create-room", {
            roomName: roomName.trim()
        });

        if (roomName) {
            toast.success('Room created');
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-96">
                <h2 className="text-lg font-semibold mb-4">Create Room</h2>

                <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Room name"
                    className="w-full px-4 py-3 rounded-lg text-white mb-4 border border-blue-700"
                />

                <div className="flex justify-end gap-3">
                    <button className="cursor-pointer" onClick={onClose}>Cancel</button>
                    <button
                        onClick={handleCreate}
                        className="bg-purple-600 px-4 py-2 rounded-lg cursor-pointer"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateRoomModal;

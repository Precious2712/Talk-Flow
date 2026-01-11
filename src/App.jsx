import { Outlet } from "react-router-dom";
import { AppProvider } from "./use-context/useContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AppProvider>
      <Outlet />
      <ToastContainer position="top-right" autoClose={3000} />
    </AppProvider>
  );
}

export default App;
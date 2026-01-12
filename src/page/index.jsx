import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-900 via-slate-900 to-indigo-900/20">
            <div className="text-center space-y-8">
                <div className="space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white">
                        Welcome
                    </h1>
                    <p className="text-lg text-slate-400">
                        Choose an option to continue
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/login" className="w-full cursor-pointer sm:w-auto">
                        <button className="w-full cursor-pointer px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition">
                            Login
                        </button>
                    </Link>

                    <Link to="/signup" className="w-full sm:w-auto">
                        <button className="cursor-pointer w-full px-8 py-3 rounded-lg border border-slate-500 text-white hover:bg-white/10 transition">
                            Sign Up
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;

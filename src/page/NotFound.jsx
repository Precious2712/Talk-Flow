import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-900 via-purple-900 to-slate-900 px-6">
            <div className="max-w-xl w-full text-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/20">

               
                <h1 className="text-8xl font-extrabold text-white tracking-widest">
                    404
                </h1>

                
                <h2 className="mt-4 text-2xl font-semibold text-white">
                    Page Not Found
                </h2>

                <p className="mt-3 text-slate-300">
                    Sorry, the page you&apos;re looking for doesn&apos;t exist or was moved.
                </p>

               
                <div className="mt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-medium shadow-lg"
                    >
                        Go back home
                    </Link>
                </div>

                
                <div className="mt-10 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

               
                <p className="mt-6 text-sm text-slate-400">
                    If you believe this is an error, please contact support.
                </p>
            </div>
        </div>
    );
}

export default NotFound;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function SignupForm() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(
                "https://realtime-chathub.onrender.com/api/v1/create-user",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Signup failed");
            }

            navigate("/login");
            toast.success('Account created');

        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Create account</h1>
                <p className="text-slate-400">
                    Join us and start your journey today
                </p>
            </div>

            
            <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-xl border border-white/10 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                   
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                   
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                   
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-10 cursor-pointer rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin cursor-pointer" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>
            </div>

            
            <p className="text-center text-slate-400">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                    Login
                </Link>
            </p>
        </div>
    );
}

export default SignupForm;

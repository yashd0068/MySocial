import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import GoogleLoginButton from "./GoogleLoginButton";
import { motion } from "framer-motion";
import "remixicon/fonts/remixicon.css";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password) {
            toast.error("Please fill in all fields!");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Registration successful!");
                navigate("/login");
            } else {
                toast.error(data.message || "Registration failed!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error connecting to server!");
        }
    };

    const githubLogin = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = "http://localhost:5173/github-callback";

        window.location.href =
            `https://github.com/login/oauth/authorize` +
            `?client_id=${clientId}` +
            `&redirect_uri=${redirectUri}` +
            `&scope=read:user user:email`;
    };

    const facebookLogin = () => {
        const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
        const redirectUri = "http://localhost:5173/facebook-callback";

        window.location.href =
            `https://www.facebook.com/v18.0/dialog/oauth` +
            `?client_id=${appId}` +
            `&redirect_uri=${redirectUri}` +
            `&scope=email,public_profile`;
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex items-center justify-center px-6 py-12 overflow-hidden">

            {/* Very subtle light grain texture for premium depth – no distracting patterns */}
            <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://assets.codepen.io/605876/noise.png')] mix-blend-multiply" />

            <div className="relative w-full max-w-7xl mx-auto z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">

                    {/* LEFT: Clean Brand + Premium Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="hidden sm:flex flex-col items-start order-2 lg:order-1"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-16 text-gray-900">
                            Todo<span className="text-indigo-600">Pro</span>
                        </h1>

                        <div className="w-full rounded-3xl border border-gray-200/60 bg-white/70 backdrop-blur-xl p-10 md:p-12 shadow-2xl">
                            <img
                                src="https://themewagon.com/wp-content/uploads/2022/03/Final-1.png"
                                alt="TodoPro premium dashboard"
                                className="w-full rounded-2xl shadow-inner"
                            />
                        </div>

                        <div className="mt-16 space-y-6 text-left">
                            <p className="text-2xl md:text-3xl font-semibold text-gray-900">
                                Focused work, without noise.
                            </p>
                            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                                A modern task management platform trusted by high-performing users worldwide.
                            </p>
                        </div>
                    </motion.div>

                    {/* RIGHT: Minimalist Register Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="order-1 lg:order-2 w-full max-w-md mx-auto"
                    >
                        <div className="text-center lg:text-left mb-12">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                                Get started free
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                No subscription required • Unlimited tasks
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full rounded-xl border border-gray-300 bg-white/80 px-6 py-4.5 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@company.com"
                                    className="w-full rounded-xl border border-gray-300 bg-white/80 px-6 py-4.5 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Create a secure password"
                                    className="w-full rounded-xl border border-gray-300 bg-white/80 px-6 py-4.5 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-indigo-600 py-4.5 text-xl font-semibold text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl transition"
                            >
                                Create account
                            </button>
                        </form>

                        <div className="my-10 flex items-center">
                            <div className="flex-1 border-t border-gray-300" />
                            <span className="px-6 text-sm text-gray-500 bg-white/80">or continue with</span>
                            <div className="flex-1 border-t border-gray-300" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <GoogleLoginButton />
                            <button
                                onClick={githubLogin}
                                className="flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white/80 py-4 text-base font-medium text-gray-700 hover:shadow-md transition"
                            >
                                <i className="ri-github-fill text-2xl" />
                                GitHub
                            </button>
                            <button
                                onClick={facebookLogin}
                                className="flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white/80 py-4 text-base font-medium text-gray-700 hover:shadow-md transition"
                            >
                                <i className="ri-facebook-circle-fill text-2xl" />
                                Facebook
                            </button>
                        </div>

                        <p className="mt-12 text-center text-base text-gray-600">
                            Already have an account?{" "}
                            <span
                                onClick={() => navigate("/login")}
                                className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer hover:underline transition"
                            >
                                Sign in
                            </span>
                        </p>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
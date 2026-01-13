import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import GoogleLoginButton from "./GoogleLoginButton";
import { motion } from "framer-motion";
import "remixicon/fonts/remixicon.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                toast.success("Welcome back");
                setTimeout(() => navigate("/home"), 800);
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error. Please try again.");
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

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="
          w-full max-w-md rounded-2xl
          border border-gray-200/70
          bg-white
          px-8 py-10
          shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        "
            >
                {/* Brand */}
                <div className="mb-10 text-center">
                    <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">
                        My<span className="text-indigo-600">App</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to continue
                    </p>
                </div>

                {/* Social Auth */}
                <div className="flex flex-col gap-3 mb-7">
                    <GoogleLoginButton />

                    <button
                        onClick={githubLogin}
                        className="
              flex items-center justify-center gap-2
              rounded-xl border border-gray-300/80
              py-3 text-sm font-medium text-gray-700
              bg-white
              hover:bg-gray-50
              transition-colors
            "
                    >
                        <i className="ri-github-fill text-base text-gray-800" />
                        Continue with GitHub
                    </button>
                </div>

                {/* Divider */}
                <div className="my-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-200/80" />
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                        Email login
                    </span>
                    <div className="h-px flex-1 bg-gray-200/80" />
                </div>

                {/* Email Login */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email address"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="
              w-full rounded-lg
              border border-gray-300/80
              px-4 py-3 text-sm text-gray-900
              placeholder:text-gray-400
              focus:outline-none
              focus:border-indigo-500
              focus:ring-2 focus:ring-indigo-500/10
            "
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="
              w-full rounded-lg
              border border-gray-300/80
              px-4 py-3 text-sm text-gray-900
              placeholder:text-gray-400
              focus:outline-none
              focus:border-indigo-500
              focus:ring-2 focus:ring-indigo-500/10
            "
                    />

                    <button
                        type="submit"
                        className="
              w-full rounded-xl
              bg-indigo-600
              py-3 text-sm font-semibold
              text-white
              transition-colors
              hover:bg-indigo-700
            "
                    >
                        Sign in
                    </button>

                    <div className="text-right">
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-sm font-medium text-gray-600 hover:text-indigo-600"
                        >
                            Forgot password?
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <p className="mt-9 text-center text-sm text-gray-600">
                    New here?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        className="cursor-pointer font-medium text-indigo-600 hover:underline"
                    >
                        Create an account
                    </span>
                </p>
            </motion.div>
        </div>
    );
}

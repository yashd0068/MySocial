import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function GithubCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code");

        if (!code) {
            toast.error("GitHub login failed");
            navigate("/login");
            return;
        }

        api.post("/auth/github", { code })
            .then((res) => {
                localStorage.setItem("token", res.data.token);
                toast.success("Logged in with GitHub!");
                navigate("/home");
            })
            .catch(() => {
                toast.error("GitHub authentication failed");
                navigate("/login");
            });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-lg font-semibold">Signing in with GitHub...</p>
        </div>
    );
}

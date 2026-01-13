import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function GithubCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get("code");

        if (!code) {
            toast.error("GitHub login failed");
            navigate("/login");
            return;
        }

        fetch("http://localhost:5000/api/auth/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        })
            .then((res) => res.json()) // back res to js object 

            .then((data) => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    toast.success("Logged in with GitHub!");
                    navigate("/home");
                } else {
                    throw new Error("No token");
                }
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

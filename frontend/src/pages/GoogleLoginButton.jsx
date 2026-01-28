import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const GoogleLoginButton = () => {
    const navigate = useNavigate();

    const onSuccess = async (res) => {
        try {
            await api.post(
                "/auth/google",
                { credential: res.credential },
                { withCredentials: true }
            );

            // ✅ Cookie is set by backend
            navigate("/Home");

        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <GoogleLogin
            onSuccess={onSuccess}
            onError={() => console.log("Google Login Error")}
        />
    );
};

export default GoogleLoginButton;

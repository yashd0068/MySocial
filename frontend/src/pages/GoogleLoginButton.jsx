import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const GoogleLoginButton = () => {
    const navigate = useNavigate();


    const onSuccess = async (res) => {
        try {

            const response = await api.post("/auth/google", {
                credential: res.credential,
            }

            );


            localStorage.setItem("token", response.data.token);
            navigate("/Home");
        } catch (error) {
            console.error("Login failed:", error);

        }

    }



    return <GoogleLogin onSuccess={onSuccess} onError={() => console.log("Error")} />;



};



export default GoogleLoginButton;

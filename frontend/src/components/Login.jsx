import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import google_image from "../assets/google.png";
import google_logo1 from "../assets/logo1.png";

const Login = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Redirect to /Home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/Dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white p-10 rounded-2xl shadow-xl flex flex-col items-center space-y-6 w-full max-w-sm">
        {/* Optional logo at the top */}
        <img src={google_image} alt="App Logo" className="w-40 h-20" />
        <h2 className="text-2xl font-semibold">Login</h2>
        <button
          onClick={() => loginWithRedirect()}
          className="w-full flex items-center justify-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow transition duration-300"
        >
          <img src={google_logo1} alt="Google" className="w-5 h-5" />
          <span>Login with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;

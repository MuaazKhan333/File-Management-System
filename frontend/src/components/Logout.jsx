import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";

const Logout = () => {
  const { logout } = useAuth0();

  return (
    <button
      className="w-full flex items-center justify-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow transition duration-300"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log Out
    </button>
  );
};

export default Logout;

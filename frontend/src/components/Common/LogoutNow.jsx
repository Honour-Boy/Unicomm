import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useChatStore from "../Firebase/chatStore";
import useUserStore from "../Firebase/userStore";
import { auth } from "../Firebase/firebase";
import { logout } from "../../assets";
import { useState } from "react";

const LogoutNow = () => {
  const { setAllowUser } = useAuth();
  const { resetChat } = useChatStore();
  const { clearUserInfo } = useUserStore();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const logoutFunc = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("uid");
    resetChat();
    auth.signOut();
    setAllowUser(false);
    navigate("/");
    clearUserInfo();
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => logoutFunc()}
    >
      <div className="relative">
        <img src={logout} alt="icons" />
        {hovered && (
          <span className="absolute top-0 left-full ml-2 p-2 text-xs bg-[#373737] text-white font-bold rounded">
            Logout
          </span>
        )}
      </div>
    </div>
  );
};
export default LogoutNow;

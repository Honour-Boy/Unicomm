import { useState } from "react";
import { chat, profile1 } from "../../assets";
import LogoutNow from "./LogoutNow";

const Navbar = () => {
  return (
    <div className="h-screen w-10 flex flex-col justify-between bg-[#313131] text-white border-r-[#828181] border-r-2 p-2">
      <div className="flex flex-col items-center mt-8 space-y-8">
        <NavIcon icon={profile1} label="Profile" />
        <NavIcon icon={chat} label="Chat" />
      </div>
      <div className="flex flex-col items-center mb-8">
        <LogoutNow />
      </div>
    </div>
  );
};

const NavIcon = ({ icon, label }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <img src={icon} alt="icons" />
        {hovered && (
          <span className="absolute top-0 left-full ml-2 p-2 text-xs bg-[#373737] text-white font-bold rounded">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default Navbar;

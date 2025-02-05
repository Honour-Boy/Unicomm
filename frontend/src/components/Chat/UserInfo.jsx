import useUserStore from "../Firebase/userStore";
import { menuDotsIcon } from "../../assets";

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const letter =
    currentUser?.fullName?.split(" ")[0].charAt(0) +
    currentUser?.fullName?.split(" ")[0].charAt(1).toUpperCase();
  return (
    <div className="flex items-center justify-between w-full p-3 mt-2">
      <div className="flex items-center space-x-2">
        <div className="user-avatar">
          <span className="text-2xl font-bold">{letter}</span>
        </div>
        <h2 className="text-lg font-bold text-white">
          {currentUser?.fullName.split(" ")[0]}
        </h2>
      </div>
        <img src={menuDotsIcon} alt="icons" className="w-6 lex gap-2" />
    </div>
  );
};

export default Userinfo;

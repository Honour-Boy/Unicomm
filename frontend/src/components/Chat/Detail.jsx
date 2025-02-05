import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import useChatStore from "../Firebase/chatStore";
import { db } from "../Firebase/firebase";
import useUserStore from "../Firebase/userStore";
import languages from "../Common/Languages";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  const truncateMessage = (message, wordLimit = 4) => {
    const words = message.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + " ...";
    }
    return message;
  };

  return (
    <div className="text-white w-1/5 space-y-4 h-screen rounded-lg">
      <div className="h-1/5 flex flex-col gap-2 items-center space-x-4 p-4 border-b border-[#373737]">
      {/* <h2 className="font-bold text-xl mb-5">User Details</h2> */}
        <div className="user-avatar bg-[#8989899b] text-[white]">
          <span className="text-2xl font-bold">
            {user?.fullName.charAt(0) + user?.fullName.charAt(1).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.username}</h2>
          <p className="text-[#9e9e9e] text-sm">{user?.email}</p>
        </div>
      </div>
      <div className="space-y-4 p-4 flex flex-col justify-around h-3/4">
        <div className="flex items-start gap-2">
          <h2 className="text-md font-semibold text-left">Bio:</h2>
          <p className="text-[#9e9e9e] text-left">
            {truncateMessage(user?.bio, 12)}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <h2 className="text-md font-semibold text-left">Language:</h2>
          {languages
            .filter((lang) => lang.value === user?.language)
            .map((lang) => (
              <p key={lang.value} className="text-[#9e9e9e]">
                {lang.label}
              </p>
            ))}
        </div>
        <div className="flex items-start gap-2">
          <h2 className="text-md font-semibold text-left">Job Title: </h2>
          <p className="text-[#9e9e9e] text-left">{user?.jobTitle}</p>
        </div>
        <div className="flex items-start gap-2">
          <h2 className="text-md font-semibold text-left">Organization: </h2>
          <p className="text-[#9e9e9e] text-left">{user?.organization}</p>
        </div>
        <div className="flex flex-col gap-4 mb-3">
          <button
            onClick={handleBlock}
            className="bg-[#555555] hover:bg-[#898989] text-white font-bold py-2 px-4 rounded-lg w-full"
            disabled={isCurrentUserBlocked}
          >
            {isCurrentUserBlocked
              ? "You are Blocked!"
              : isReceiverBlocked
              ? "Unblock User"
              : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;

import { useEffect, useState } from "react";
import { Chat, Detail, List } from "../components/Chat";
import useChatStore from "../components/Firebase/chatStore";
import LoadingSpinner from "../components/Common/LoadingComponent";
import Navbar from "../components/Common/Navbar";

const ChatRoom = () => {
  const { chatId, isCurrentUserBlocked } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(!chatId);
  }, [chatId]);

  return (
    <div className="bg-[#1a1a1a] -z-50 text-white min-h-screen flex flex-row w-screen">
      <Navbar />
      <div className="flex items-center w-[calc(100vw-40px)]">
        <List />
        <span className="divider"></span>
        {isLoading ? (
          <div className="flex items-center justify-center bg-[#1a1a1a] w-full h-screen text-white flex-col gap-2">
            <LoadingSpinner />
            Loading...
          </div>
        ) : isCurrentUserBlocked ? (
          <div className="flex items-center justify-center bg-[#1a1a1a] w-full h-screen text-white flex-col gap-2">
            You Have Been Blocked
          </div>
        ) : (
          <>
            <Chat />
            <span className="divider"></span>
            <Detail />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;

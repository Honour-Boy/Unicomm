import { useEffect, useState } from "react";
import useUserStore from "../Firebase/userStore";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
  arrayUnion,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../Firebase/firebase";
import useChatStore from "../Firebase/chatStore";
import { searchIcon, plusIcon } from "../../assets";
import { format } from "timeago.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../Common/LoadingComponent";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const [toastify, setToast] = useState();
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data() || [];
        const promises = items.chats.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          const chatDocRef = doc(db, "chats", item.chatId);
          const chatDocSnap = await getDoc(chatDocRef);
          const messages = chatDocSnap.data()?.messages
          const time = messages[messages.length - 1]?.createdAt || null;

          return { ...item, user, lastUpdated: time, updatedAt: items.updatedAt };
        });
        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  useEffect(() => {
    toast.info(toastify);
  }, [toastify]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const userRef = collection(db, "users");
        const q = query(userRef, limit(5));
        const querySnapShot = await getDocs(q);

        const suggestionList = querySnapShot.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .filter(
            (suggestion) =>
              suggestion.id !== currentUser.id &&
              !chats.some((chat) => chat.user.id === suggestion.id) // Exclude users already in chat list
          );

        setSuggestions(suggestionList);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSuggestions();
  }, [currentUser.id, chats]);

  const handleSearch = async () => {
    let username = input.trim();

    // Prepend "@" if not already present
    if (!username.startsWith("@")) {
      username = "@" + username;
    }

    setUser(null);
    setIsLoading(true);

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setIsLoading(false);
        setUser({
          ...querySnapShot.docs[0].data(),
          id: querySnapShot.docs[0].id,
        });
      } else {
        setUser(null);
        setIsLoading(null);
        setError("The username above was not found.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async (userToAdd) => {
    if (!userToAdd || !currentUser) return;

    // Check if the user is trying to add themselves
    if (userToAdd.id === currentUser.id) {
      setToast("You cannot add yourself to the chat list.");
      return;
    }
    setIsAdding(true);
    setToast("Adding user to chat list...");
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    try {
      const newChatRef = doc(chatRef);

      const timestamp = serverTimestamp(); // Get server timestamp

      // Ensure the userchats document exists for the other user
      const userDocRef = doc(userChatsRef, userToAdd.id);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, { chats: [] });
      }

      // Ensure the userchats document exists for the current user
      const currentUserDocRef = doc(userChatsRef, currentUser.id);
      const currentUserDocSnap = await getDoc(currentUserDocRef);
      if (!currentUserDocSnap.exists()) {
        await setDoc(currentUserDocRef, { chats: [] });
      }

      // Check if the chat already exists for the current user
      const currentUserChats = currentUserDocSnap.data()?.chats || [];
      const existingChat = currentUserChats.find(
        (chat) => chat.receiverId === userToAdd.id
      );

      if (existingChat) {
        setToast("User is already in your chat list.");
        setIsAdding(false);
        return;
      }

      // Create new chat document
      await setDoc(newChatRef, {
        createdAt: timestamp,
        messages: [],
      });

      // Update "userchats" collection for the other user
      await updateDoc(userDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          lastTranslatedMessage: "",
          receiverId: currentUser.id,
        }),
        updatedAt: timestamp,
      });

      // Update "userchats" collection for the current user
      await updateDoc(currentUserDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          lastTranslatedMessage: "",
          receiverId: userToAdd.id,
        }),
        updatedAt: timestamp,
      });
      setToast("User added successfully!");
      setUser(null); // Reset the user state after adding
    } catch (err) {
      console.log(err); // Log any errors
    } finally {
      setIsAdding(false); // Reset loading state
    }
  };

  const handleSelect = (chatId, userInfo) => {
    changeChat(chatId, userInfo);
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  const truncateMessage = (message, wordLimit = 4) => {
    const words = message.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + " ...";
    }
    return message;
  };

  return (
    <div className="flex-1 overflow-y-auto h-[40rem] items-start flex flex-col w-full p-2 chatlist">
      <ToastContainer position="top-center" />
      <div className="flex items-center gap-2 w-full my-2">
        <div className="flex items-center gap-2 flex-1 bg-[#373737] rounded-lg w-60 p-1 border">
          <img
            src={searchIcon}
            alt="search"
            className="w-5 h-5 cursor-pointer"
            onClick={handleSearch}
          />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-white w-full flex-1 p-1"
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      {isLoading === true && input !== "" && (
        <div className="mt-3">
          <LoadingSpinner />
        </div>
      )}
      {!user && isLoading === null && (
        <div className="mt-3 text-left">{error}</div>
      )}
      {user && (
        <div className="mt-3 flex items-center gap-3 bg-[#2d2d2d] p-3 rounded-lg shadow-md">
          <span className="text-white">{user.username}</span>
          <img
            src={plusIcon}
            alt="add user"
            className="w-6 h-6 cursor-pointer"
            onClick={() => handleAdd(user)}
          />
        </div>
      )}
      <div className="mt-5 w-full flex flex-col">
        <h3 className="text-lg font-semibold text-white text-left">
          Suggestions
        </h3>
        <div className="w-full mt-3 overflow-x-auto scrollbar-hide px-1">
          <div className="w-max flex flex-row gap-5">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-end gap-3 bg-[#2d2d2d] p-3 rounded-lg shadow-md"
              >
                <span className="text-white">{suggestion.username}</span>
                <img
                  src={plusIcon}
                  alt="add user"
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => handleAdd(suggestion)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="mt-2 font-semibold text-white">Chats</span>
      {chats.length === 0 && (
        <p className="text-[#7e7e7e] text-md text-center w-full p-4">
          You have no chats yet
        </p>
      )}
      {filteredChats.map((chat) => (
        <div
          key={chat.chatId}
          className={`flex w-full items-center gap-4 p-3 cursor-pointer border-y border-[#373737] ${
            !chat.isSeen && "bg-[#393939]"
          }`}
          onClick={() => handleSelect(chat.chatId, chat.user)}
        >
          <div className="user-avatar-small">
            <span className="text-lg font-bold">
              {chat.user.fullName?.split(" ")[0].charAt(0) +
                chat.user.fullName?.split(" ")[0].charAt(1).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex justify-between items-center">
              <span className="font-medium text-left text-white">
                {chat.user.username}
              </span>
              <span className="text-[10px] text-white">
                {format(chat.lastUpdated?.toDate())}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-left font-light text-white">
                {chat.user.blocked.includes(currentUser.id)
                  ? "Blocked"
                  : truncateMessage(chat.lastMessage)}
              </p>
              {!chat.isSeen && chat.lastMessage !== "" && (
                <span className="bg-orange-300 rounded-full w-3 h-3"></span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;

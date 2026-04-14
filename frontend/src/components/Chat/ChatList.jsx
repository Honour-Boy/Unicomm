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
          const lastId = messages[messages.length - 1]?.senderId || null;

          return { ...item, user, lastUpdated: time, updatedAt: items.updatedAt, id: lastId };
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
          receiverId: currentUser.id,
        }),
        updatedAt: timestamp,
      });

      // Update "userchats" collection for the current user
      await updateDoc(currentUserDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
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
    <div className="flex-1 overflow-y-auto items-start flex flex-col w-full px-3 py-3 gap-1 uni-scroll">
      <ToastContainer position="top-center" theme="dark" />
      <div className="flex items-center gap-2 w-full">
        <div className="flex items-center gap-2 flex-1 bg-uni-surface border border-uni-border rounded-full px-3 py-2 focus-within:border-indigo-500/60 transition-colors">
          <img
            src={searchIcon}
            alt="search"
            className="w-4 h-4 cursor-pointer opacity-70"
            onClick={handleSearch}
          />
          <input
            type="text"
            placeholder="Search conversations"
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-uni-muted w-full flex-1"
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
        <div className="mt-3 flex items-center justify-between gap-3 bg-uni-surface border border-uni-border p-3 rounded-xl w-full">
          <span className="text-white text-sm">{user.username}</span>
          <img
            src={plusIcon}
            alt="add user"
            className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100"
            onClick={() => handleAdd(user)}
          />
        </div>
      )}
      <div className="mt-4 w-full flex flex-col">
        <h3 className="text-xs font-semibold text-uni-muted text-left uppercase tracking-wider px-1">
          Suggestions
        </h3>
        <div className="w-full mt-2 overflow-x-auto scrollbar-hide">
          <div className="w-max flex flex-row gap-2 pb-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleAdd(suggestion)}
                className="flex items-center gap-2 bg-uni-surface border border-uni-border hover:border-indigo-500/60 px-3 py-2 rounded-full transition-colors"
              >
                <span className="text-white text-xs">{suggestion.username}</span>
                <img
                  src={plusIcon}
                  alt="add user"
                  className="w-4 h-4 cursor-pointer opacity-80"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      <h3 className="mt-4 text-xs font-semibold text-uni-muted uppercase tracking-wider px-1 self-start">
        Chats
      </h3>
      {chats.length === 0 && (
        <p className="text-uni-muted text-sm text-center w-full py-6">
          You have no chats yet
        </p>
      )}
      <div className="w-full flex flex-col gap-0.5 mt-1">
        {filteredChats.map((chat) => (
          <div
            key={chat.chatId}
            className="flex w-full items-center gap-3 p-2.5 cursor-pointer rounded-xl hover:bg-uni-surface transition-colors"
            onClick={() => handleSelect(chat.chatId, chat.user)}
          >
            <div className="user-avatar-small text-sm">
              {(chat.user.fullName?.split(" ")[0]?.charAt(0) || "") +
                (chat.user.fullName?.split(" ")[0]?.charAt(1)?.toUpperCase() ||
                  "")}
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="font-medium text-left text-white text-sm truncate">
                  {chat.user.username}
                </span>
                <span className="text-[10px] text-uni-muted shrink-0">
                  {chat.lastUpdated?.toDate
                    ? format(chat.lastUpdated.toDate())
                    : ""}
                </span>
              </div>
              <p className="text-xs text-left text-uni-muted truncate">
                {chat.user.blocked?.includes(currentUser.id)
                  ? "Blocked"
                  : chat.id === currentUser?.id
                  ? truncateMessage(chat.lastMessage || "")
                  : truncateMessage(chat.lastTranslatedMessage || "")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;

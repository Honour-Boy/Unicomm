import { useEffect, useRef, useState } from "react";
import {
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../Firebase/firebase";
import useChatStore from "../Firebase/chatStore";
import useUserStore from "../Firebase/userStore";
import { format } from "timeago.js";
import {
  infoIcon,
  phoneIcon,
  videoIcon,
  emojiIcon,
  linkIcon,
} from "../../assets";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import languages from "../Common/Languages";

const Chat = () => {
  const [chat, setChat] = useState("");
  const [sent, setSent] = useState(false);
  const [change, setChange] = useState(true);
  const [text, setText] = useState("");
  const [open, setOpen] = useState();
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const endRef = useRef(null);

  useEffect(() => {
    if (chat?.messages) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const currentUserLang = languages.find(
    (lang) => lang.value === currentUser?.language
  )?.value;
  const userLang = languages.find(
    (lang) => lang.value === user?.language
  )?.value;

  const handleSend = async () => {
    if (text === "") return;

    let translatedText = text; // Default to original text

    try {
      if (currentUser.language !== user.language) {
        const response = await axios.post("http://localhost:8001/translate", {
          source_language: currentUserLang,
          target_language: userLang,
          text: text,
        });

        if (response.status === 200) {
          translatedText = response.data["translated_text"];
        }
      }

      if (chatId) {
        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            text,
            translatedText: translatedText,
            createdAt: new Date(),
          }),
        });

        const userIDs = [currentUser.id, user.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "userchats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chats.findIndex(
              (c) => c.chatId === chatId
            );

            if (chatIndex !== -1) {
              userChatsData.chats[chatIndex].lastMessage = text;
              userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
              userChatsData.chats[chatIndex].updatedAt = Date.now();

              await updateDoc(userChatsRef, {
                chats: userChatsData.chats,
              });
            }
          }
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setText("");
      setSent(false);
    }
  };

  const handleEmoji = (e) => {
    if (!isReceiverBlocked) {
      setText((prev) => prev + e.emoji);
    }
  };

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    setText(inputText);
  };

  return (
    <div className="chat-container bg-[#1a1a1a]">
      <div className="chat-header">
        <div className="header-user-info">
          <div className="user-avatar">
            <span className="text-xl font-bold">
              {user?.fullName.charAt(0) +
                user?.fullName.charAt(1).toUpperCase()}
            </span>
          </div>
          <div className="ml-2 flex flex-col gap-0">
            <span className="username">{user?.fullName}</span>
            <p className="username-des">{user?.username}</p>
          </div>
        </div>
        <div className="icons">
          <img src={phoneIcon} alt="Icons" />
          <img src={videoIcon} alt="Icons" />
          <img src={infoIcon} alt="Icons" />
        </div>
      </div>
      <div className="chat-messages">
        {chat?.messages?.map((message) => (
          <div
            className={`message-container ${
              message.senderId === currentUser?.id ? "sent" : "received"
            }`}
            key={message?.createdAt?.seconds}
          >
            <div
              className={`message ${
                message.senderId === currentUser?.id ? "sent" : "received"
              }`}
              key={message?.createdAt?.seconds}
              onMouseOver={() => setChange(false)}
              onMouseLeave={() => setChange(true)}
            >
              <p className="text-left">
                {message.senderId === currentUser?.id
                  ? change
                    ? message.text
                    : message.translatedText
                  : change
                  ? message.translatedText
                  : message.text}
              </p>
              <span className="message-time">
                {format(message.createdAt.toDate())}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="flex gap-4 w-full border-t-2 border-[#373737] p-4">
        <div className="flex gap-2">
          <img src={linkIcon} alt="icons" className="w-6" />
        </div>
        <div className="chat-input-section relative">
          <div className="text-input-container">
            <input
              type="text"
              placeholder={
                isCurrentUserBlocked || isReceiverBlocked
                  ? "You cannot send a message"
                  : "Type a message..."
              }
              value={!sent ? text : ""}
              onChange={handleTextChange}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
              className="text-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                  setSent(true);
                }
              }}
            />
            <div className="relative">
              <img
                src={emojiIcon}
                alt="emoji"
                className="w-6 ml-2 cursor-pointer"
                onClick={() => {
                  if (!isReceiverBlocked) setOpen((prev) => !prev);
                }}
              />
              <span className="absolute bottom-8 right-0">
                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
              </span>
            </div>
            <button
              className="send-button ml-3 bg-orange-600 hover:bg-orange-900"
              onClick={handleSend}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

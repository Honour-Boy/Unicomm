import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useChatStore from "@/store/chatStore";
import useUserStore from "@/store/userStore";
import EmojiPicker from "emoji-picker-react";
import languages from "@/components/common/Languages";
import { isUserOnline } from "@/hooks/usePresence";
import { sendChatMessage } from "@/services/messages";
import MessageBubble from "@/components/chat/MessageBubble";
import Spinner from "@/components/ui/Spinner";
import { SendIcon, EmojiIcon, Arrow, Dot } from "@/components/ui/icons";

const Chat = ({ onHeaderClick, detailOpen }) => {
  const [chat, setChat] = useState("");
  const [liveUser, setLiveUser] = useState(null);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [expandedOriginals, setExpandedOriginals] = useState({});

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
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => unSub();
  }, [chatId]);

  // Subscribe to recipient for dynamic presence
  useEffect(() => {
    if (!user?.id) return;
    const unsub = onSnapshot(doc(db, "users", user.id), (snap) => {
      if (snap.exists()) setLiveUser({ ...snap.data(), id: user.id });
    });
    return () => unsub();
  }, [user?.id]);

  // Re-render periodically so "lastSeen" staleness updates without new writes
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const online = isUserOnline(liveUser);

  const currentUserLang = languages.find(
    (lang) => lang.value === currentUser?.language
  );
  const userLang = languages.find((lang) => lang.value === user?.language);

  const sourceCode = currentUserLang?.value?.toUpperCase() || "EN";
  const targetCode = userLang?.value?.toUpperCase() || "EN";
  const targetLabel = userLang?.label || "English";
  const sourceLabel = currentUserLang?.label || "English";

  const doSend = async (messageText) => {
    if (!messageText || !chatId) return;
    setIsSending(true);
    setSendError(null);
    try {
      await sendChatMessage({
        chatId,
        currentUser,
        receiver: user,
        text: messageText,
        sourceLang: currentUserLang?.value || "en",
        targetLang: userLang?.value || "en",
      });
      setText("");
    } catch (err) {
      console.log(err);
      setSendError(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    doSend(t);
  };

  const handleRetry = () => {
    if (sendError) doSend(sendError);
  };

  const handleEmoji = (e) => {
    if (!isReceiverBlocked) setText((prev) => prev + e.emoji);
  };

  const toggleOriginal = (key) => {
    setExpandedOriginals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const disabled = isCurrentUserBlocked || isReceiverBlocked;

  return (
    <div className="chat-container">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-uni-border bg-uni-bg/80 backdrop-blur">
        <button
          onClick={onHeaderClick}
          className="flex items-center gap-3 min-w-0 rounded-lg p-1 -m-1 hover:bg-uni-surface/60 transition-colors text-left"
          aria-expanded={detailOpen}
          aria-label="Open profile"
        >
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-uni-muted uppercase">
            <span className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
            Unicomm
          </span>
          <span className="hidden sm:block w-px h-5 bg-uni-border" />
          <div className="user-avatar !w-10 !h-10 text-sm">
            {(user?.fullName?.charAt(0) || "") +
              (user?.fullName?.charAt(1)?.toUpperCase() || "")}
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm md:text-base font-semibold text-white truncate">
              {user?.fullName || "Select a chat"}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-uni-muted">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  online ? "bg-uni-online animate-pulse-dot" : "bg-uni-muted/50"
                }`}
              />
              {online ? "Online" : "Offline"}
            </span>
          </div>
        </button>
        <button
          onClick={onHeaderClick}
          className="p-2 rounded-lg text-uni-muted hover:text-white hover:bg-uni-surface transition-colors"
          title={detailOpen ? "Close profile" : "View profile"}
          aria-label="Profile details"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto uni-scroll px-3 md:px-8 py-4 md:py-6 space-y-3">
        {(!chat?.messages || chat.messages.length === 0) && (
          <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4 text-3xl">
              🌍
            </div>
            <p className="text-lg font-semibold text-white">
              Start a conversation across languages
            </p>
            <p className="text-sm text-uni-muted mt-1 max-w-xs">
              Messages you send in {sourceLabel} will appear to{" "}
              {user?.fullName?.split(" ")[0] || "your contact"} in {targetLabel}
              , instantly.
            </p>
          </div>
        )}

        {chat?.messages?.map((message, idx) => {
          const key = message?.createdAt?.seconds || idx;
          return (
            <MessageBubble
              key={key}
              message={message}
              isMine={message.senderId === currentUser?.id}
              showOriginal={!!expandedOriginals[key]}
              targetLabel={targetLabel}
              sourceLabel={sourceLabel}
              onToggleOriginal={() => toggleOriginal(key)}
            />
          );
        })}

        {/* Sending / translating indicator */}
        {isSending && (
          <div className="flex justify-end animate-fade-in-up">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-uni-surface border border-uni-border text-uni-muted text-xs">
              <Dot /> <Dot style={{ animationDelay: "150ms" }} />{" "}
              <Dot style={{ animationDelay: "300ms" }} />
              <span className="ml-1">Translating…</span>
            </div>
          </div>
        )}

        {/* Error state with retry */}
        {sendError && !isSending && (
          <div className="flex justify-end animate-fade-in-up">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              <span>Translation failed. Message not sent.</span>
              <button
                onClick={handleRetry}
                className="font-semibold text-white bg-red-500/80 hover:bg-red-500 px-2.5 py-1 rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      {/* Input bar */}
      <div className="border-t border-uni-border bg-uni-bg px-3 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-uni-surface border border-uni-border text-[11px] font-semibold text-uni-muted">
            <span className="text-white">{sourceCode}</span>
            <Arrow />
            <span className="text-indigo-400">{targetCode}</span>
          </div>

          <div className="flex-1 flex items-center gap-2 bg-uni-surface border border-uni-border rounded-full pl-4 pr-2 py-1.5 focus-within:border-indigo-500/60 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all">
            <input
              type="text"
              placeholder={
                disabled ? "You cannot send a message" : "Type your message…"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={disabled}
              className="flex-1 bg-transparent border-none outline-none text-sm md:text-[15px] text-white placeholder:text-uni-muted disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => !isReceiverBlocked && setOpenEmoji((p) => !p)}
                className="p-1.5 rounded-full text-uni-muted hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Emoji"
              >
                <EmojiIcon />
              </button>
              {openEmoji && (
                <span className="absolute bottom-12 right-0 z-20">
                  <EmojiPicker
                    theme="dark"
                    open={openEmoji}
                    onEmojiClick={handleEmoji}
                  />
                </span>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={disabled || !text.trim() || isSending}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-bubble-sent text-white shadow-bubble hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              aria-label="Send"
            >
              {isSending ? <Spinner size={16} /> : <SendIcon />}
            </button>
          </div>
        </div>

        {/* Mobile language indicator */}
        <div className="sm:hidden mt-2 flex justify-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-uni-surface border border-uni-border text-[10px] font-semibold text-uni-muted">
            <span className="text-white">{sourceCode}</span>
            <Arrow />
            <span className="text-indigo-400">{targetCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

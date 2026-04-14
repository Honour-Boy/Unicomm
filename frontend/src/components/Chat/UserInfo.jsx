import useUserStore from "../Firebase/userStore";

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const letter =
    (currentUser?.fullName?.split(" ")[0]?.charAt(0) || "") +
    (currentUser?.fullName?.split(" ")[0]?.charAt(1)?.toUpperCase() || "");

  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-uni-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className="user-avatar-small text-sm">{letter}</div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-uni-muted font-semibold">
            Unicomm
          </span>
          <h2 className="text-base font-semibold text-white truncate">
            {currentUser?.fullName?.split(" ")[0] || "You"}
          </h2>
        </div>
      </div>
      <button
        className="p-2 rounded-lg text-uni-muted hover:text-white hover:bg-uni-surface transition-colors"
        aria-label="More"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
    </div>
  );
};

export default Userinfo;

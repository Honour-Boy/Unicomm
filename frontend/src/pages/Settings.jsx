import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "@/lib/firebase";
import useUserStore from "@/store/userStore";
import { supportedLanguages } from "@/components/common/Languages";
import LoadingSpinner from "@/components/common/LoadingComponent";

// In-app profile editing (ROADMAP Phase 2). Pre-fills from the signed-in user's
// `users/{uid}` doc and writes edits back. Username keeps its "@"-prefix +
// uniqueness rule (only re-checked when it actually changes). Changing the
// language re-flows future translations automatically — Chat.jsx reads both
// parties' languages live, so new messages translate to the new language with
// no further action (older messages keep the translation they were sent with).
// Avatar image upload is deferred (needs Firebase Storage rules); the initials
// avatar follows `fullName`.
const FIELDS = [
  "fullName",
  "username",
  "language",
  "bio",
  "dob",
  "gender",
  "organization",
  "jobTitle",
];

const inputCls =
  "w-full bg-uni-surface border border-uni-border rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all";

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser, fetchUserInfo } = useUserStore();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Seed the form from the store once it's available (only once).
  useEffect(() => {
    if (!currentUser) return;
    setForm((prev) =>
      prev
        ? prev
        : FIELDS.reduce((acc, f) => ({ ...acc, [f]: currentUser[f] || "" }), {})
    );
  }, [currentUser]);

  const initials = useMemo(() => {
    const first = form?.fullName?.split(" ")[0] || "";
    return (first.charAt(0) || "") + (first.charAt(1)?.toUpperCase() || "");
  }, [form?.fullName]);

  if (!currentUser || !form) {
    return (
      <div className="flex items-center justify-center h-screen bg-uni-bg text-uni-text">
        <LoadingSpinner />
      </div>
    );
  }

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Name is required.";
    const username = form.username.trim();
    if (!username) e.username = "Username is required.";
    else if (!username.startsWith("@")) e.username = 'Username must start with "@".';
    if (!form.language) e.language = "Pick a language.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (saving || !validate()) return;
    setSaving(true);
    try {
      const username = form.username.trim();

      // Only re-check uniqueness if the username actually changed.
      if (username !== (currentUser.username || "")) {
        const snap = await getDocs(
          query(collection(db, "users"), where("username", "==", username))
        );
        const takenByOther = snap.docs.some((d) => d.id !== currentUser.id);
        if (takenByOther) {
          setErrors((e) => ({ ...e, username: "That username is taken." }));
          setSaving(false);
          return;
        }
      }

      const patch = FIELDS.reduce(
        (acc, f) => ({ ...acc, [f]: f === "username" ? username : form[f] }),
        {}
      );
      await updateDoc(doc(db, "users", currentUser.id), patch);

      // Refresh the store so the rest of the app reflects the edits immediately.
      await fetchUserInfo(currentUser.id);
      toast.success("Profile updated.");
      setTimeout(() => navigate("/chat"), 800);
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Couldn't save your profile. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-uni-bg text-uni-text">
      <ToastContainer position="top-center" theme="dark" />

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 md:px-6 py-3 border-b border-uni-border bg-uni-bg/90 backdrop-blur">
        <button
          onClick={() => navigate("/chat")}
          className="p-2 rounded-lg text-uni-muted hover:text-white hover:bg-uni-surface transition-colors"
          aria-label="Back to chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base md:text-lg font-semibold text-white">Edit profile</h1>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* Avatar + identity summary */}
        <section className="flex items-center gap-4">
          <div className="user-avatar !w-16 !h-16 text-xl shrink-0">{initials || "U"}</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {form.fullName || "Your name"}
            </p>
            <p className="text-xs text-uni-muted truncate">{currentUser.email}</p>
          </div>
        </section>

        {/* Identity */}
        <Section title="Identity">
          <Field label="Full name" error={errors.fullName}>
            <input type="text" value={form.fullName} onChange={set("fullName")} className={inputCls} placeholder="Your name" />
          </Field>
          <Field label="Username" error={errors.username} hint="Starts with @, unique across UniComm.">
            <input type="text" value={form.username} onChange={set("username")} className={inputCls} placeholder="@username" />
          </Field>
          <Field label="Email" hint="Managed by your sign-in; can't be edited here.">
            <input type="email" value={currentUser.email || ""} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
          </Field>
        </Section>

        {/* Language */}
        <Section title="Language">
          <Field
            label="Preferred language"
            error={errors.language}
            hint="Messages others send you are translated into this language. New messages use it right away."
          >
            <select value={form.language} onChange={set("language")} className={inputCls}>
              <option value="">Select language</option>
              {supportedLanguages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        {/* About */}
        <Section title="About">
          <Field label="Bio">
            <textarea value={form.bio} onChange={set("bio")} rows={3} className={`${inputCls} resize-none`} placeholder="A short bio" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date of birth">
              <input type="date" value={form.dob} onChange={set("dob")} className={`${inputCls} calendar-icon-white`} />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={set("gender")} className={inputCls}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Organization">
              <input type="text" value={form.organization} onChange={set("organization")} className={inputCls} placeholder="Where you work" />
            </Field>
            <Field label="Job title">
              <input type="text" value={form.jobTitle} onChange={set("jobTitle")} className={inputCls} placeholder="Your role" />
            </Field>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-uni-muted hover:text-white hover:bg-uni-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-bubble-sent text-white shadow-bubble hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Make the native date picker indicator visible on the dark theme. */}
      <style>{`.calendar-icon-white::-webkit-calendar-picker-indicator { filter: invert(1); }`}</style>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-xs font-semibold text-uni-muted uppercase tracking-wider">
      {title}
    </h2>
    {children}
  </section>
);

const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-white mb-1.5">{label}</label>
    {children}
    {error ? (
      <p className="mt-1 text-xs text-red-400">{error}</p>
    ) : hint ? (
      <p className="mt-1 text-xs text-uni-muted">{hint}</p>
    ) : null}
  </div>
);

export default Settings;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showPass, hidePass, googleLogo } from "../assets";
import { auth, googleProvider, db } from "../components/Firebase/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordShow, setPasswordShow] = useState({
    type: "password",
    img: hidePass,
  });
  const navigate = useNavigate();

  const togglePassword = () =>
    setPasswordShow((p) => ({
      ...p,
      type: p.type === "password" ? "text" : "password",
      img: p.img === hidePass ? showPass : hidePass,
    }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      const response = await axios.post(
        "http://localhost:8001/api/signin",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        localStorage.setItem("authToken", response.data.token);
        toast.success("Signed in. Redirecting…");
        setTimeout(() => {
          navigate("/chat");
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Sign-in failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          fullName: user.displayName,
          email: user.email,
          id: user.uid,
          blocked: [],
        });
        await setDoc(doc(db, "userchats", user.uid), { chats: [] });
      }

      const response = await axios.post(
        "http://localhost:8001/api/signin",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        localStorage.setItem("authToken", response.data.token);
        toast.success("Signed in with Google");

        const userData = (await getDoc(userDocRef)).data();
        setTimeout(() => {
          if (!userData.username) {
            navigate("/create-profile");
          } else {
            navigate("/chat");
            window.location.reload();
          }
        }, 1500);
      } else {
        toast.error("Google sign-in failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your conversations."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <input
            type="email"
            id="email"
            value={email}
            placeholder="you@company.com"
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <input
              type={passwordShow.type}
              id="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input pr-11"
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute inset-y-0 right-3 flex items-center text-uni-muted hover:text-white"
              aria-label="Toggle password visibility"
            >
              <img src={passwordShow.img} className="w-4" alt="" />
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-uni-muted cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-indigo-500 w-4 h-4 rounded"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-primary-btn"
        >
          {loading ? <Spinner /> : "Sign in"}
        </button>

        <div className="flex items-center gap-3 my-2 text-xs text-uni-muted">
          <span className="h-px flex-1 bg-uni-border" />
          OR
          <span className="h-px flex-1 bg-uni-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="auth-secondary-btn"
        >
          {googleLoading ? (
            <Spinner />
          ) : (
            <>
              <img src={googleLogo} alt="" className="w-4 h-4" />
              Continue with Google
            </>
          )}
        </button>

        <p className="text-center text-sm text-uni-muted pt-2">
          New to Unicomm?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Create an account
          </Link>
        </p>
      </form>
      <ToastContainer position="top-center" theme="dark" />
    </AuthLayout>
  );
}

/* --- shared auth shell --- */
export const AuthLayout = ({ title, subtitle, children, wide = false }) => (
  <div className="min-h-screen w-screen bg-uni-bg text-uni-text font-sans flex items-center justify-center px-4 py-10 relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-3xl" />
    </div>

    <div
      className={`w-full ${
        wide ? "max-w-lg" : "max-w-md"
      } bg-uni-surface/80 backdrop-blur-xl border border-uni-border rounded-2xl shadow-2xl p-7 sm:p-8 animate-fade-in-up`}
    >
      <Link to="/" className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">U</span>
        </div>
        <span className="font-bold tracking-tight">Unicomm</span>
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-uni-muted mt-1.5 mb-6">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-6" />}

      {children}
    </div>
  </div>
);

export const Field = ({ label, htmlFor, children }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-uni-muted mb-1.5 uppercase tracking-wider"
    >
      {label}
    </label>
    {children}
  </div>
);

export const Spinner = () => (
  <svg
    className="animate-spin"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="3"
      opacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 1-9 9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default Login;

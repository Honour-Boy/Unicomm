import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showPass, hidePass, googleLogo } from "../assets";
import { auth, googleProvider, db } from "../components/Firebase/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import useUserStore from "../components/Firebase/userStore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUserStore();


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
      console.log(`Email sign-in successful: ${user.uid}`);

      // Passing the token to the backend with Axios
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
        const data = response.data;
        localStorage.setItem("authToken", data.token);
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/chat");
          window.location.reload();
        }, 3000);
      } else {
        toast.error("Email sign-in failed");
      }
    } catch (error) {
      console.error("Error with email sign-in:", error.message, error.stack);
      toast.error("Invalid email or password.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();
      console.log("Google sign-in successful:", user);

      // Check if the user already exists in the database
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // If the user does not exist, create a new document
        await setDoc(userDocRef, {
          fullName: user.displayName,
          email: user.email,
          id: user.uid,
          blocked: [],
        });

        await setDoc(doc(db, "userchats", user.uid), {
          chats: [],
        });
      }

      // Passing the token to the backend with Axios
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
        const data = response.data;
        localStorage.setItem("authToken", data.token);
        toast.success("Google sign-in successful");

        // Check if the user has a username
        const userData = (await getDoc(userDocRef)).data();
        if (!userData.username) {
          console.log("Navigating to create-profile");
          setTimeout(() => {
            navigate("/create-profile");
          }, 2500);
        } else {
          console.log("Navigating to chat");
          setTimeout(() => {
            navigate("/chat");
            window.location.reload();
          }, 2500);
        }
      } else {
        toast.error("Google sign-in failed");
      }
    } catch (error) {
      console.error("Error with Google sign-in:", error.message, error.stack);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const [passwordshow, setpasswordshow] = useState({
    type: "password",
    img: hidePass,
  });

  function handlePassword() {
    setpasswordshow((prevpass) => ({
      ...prevpass,
      type: prevpass.type === "password" ? "text" : "password",
      img: prevpass.img === hidePass ? showPass : hidePass,
    }));
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen max-h-screen bg-login-pic bg-cover text-white max-w-screen">
      <ToastContainer position="top-center" />
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-[#1a1a1a] p-8 rounded-lg shadow-md"
      >
        <h2 className="text-4xl font-bold mb-2 text-center">Log in</h2>
        <label className="text-sm text-center">
          Fill in details to proceed
        </label>
        <div className="my-4">
          <label
            htmlFor="email"
            className="block text-sm text-left font-bold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            placeholder="example@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#212121] leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6 relative">
          <label
            htmlFor="password"
            className="block text-sm text-left font-bold mb-2"
          >
            Password
          </label>
          <input
            type={passwordshow.type}
            id="password"
            value={password}
            placeholder="**************"
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#212121] mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <img
            src={passwordshow.img}
            className="w-5 absolute top-9 right-2 cursor-pointer"
            id="icon1"
            onClick={handlePassword}
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="mr-2 leading-tight"
            />
            <label htmlFor="remember" className="text-sm">
              Remember me
            </label>
          </div>
          <a
            href="/forgot-password"
            className="text-sm text-orange-500 hover:text-orange-700"
          >
            Forgot password?
          </a>
        </div>
        <button
          type="submit"
          className={`bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${loading && "cursor-none"}`}
          disabled={loading}
        >
          {loading ? "Please wait..." : "Sign In"}
        </button>
        <div className="flex items-center justify-center my-6">
          <span className="border-t border-[#373737] w-full"></span>
          <span className="px-4 text-[#828282]">or</span>
          <span className="border-t border-[#373737] w-full"></span>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="bg-[#373737] hover:bg-[#474747] text-white font-bold w-full py-2 px-4 rounded flex items-center justify-center"
          >
            <img src={googleLogo} alt="google logo" className=" w-5 mr-2"/>Sign in with Google
          </button>
        </div>
        <p className="text-center text-sm mt-6">
          New user?{" "}
          <a href="/register" className="text-orange-500 hover:text-orange-700">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;


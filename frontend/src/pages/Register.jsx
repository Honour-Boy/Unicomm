import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerImage, showPass, hidePass } from "../assets";
import { db, auth } from "../components/Firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactMarkdown from "react-markdown";
import privacy from "../components/Common/PrivacyPolicy.md";
import terms from "../components/Common/Terms.md";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be at least 8 characters long and contain at least one uppercase letter and one lowercase letter.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        id: user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", user.uid), {
        chats: [],
      });

      toast.success("Registration successful!");
      setTimeout(() => {
        navigate("/create-profile");
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error.message);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
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

  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");

  useEffect(() => {
    fetch(terms)
      .then((response) => response.text())
      .then((text) => setTermsContent(text));
    fetch(privacy)
      .then((response) => response.text())
      .then((text) => setPrivacyContent(text));
  }, []);

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    setPopupContent("terms");
    setShowPopup(true);
  };

  const handlePrivacyClick = (e) => {
    e.preventDefault();
    setPopupContent("privacy");
    setShowPopup(true);
  };

  return (
    <div className="">
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white text-black p-8 rounded-lg max-w-lg w-full h-4/5 overflow-y-auto scrollbar-hide">
            <h2 className="text-2xl font-bold mb-4">
              {popupContent === "terms"
                ? "Terms and Conditions"
                : "Privacy Policy"}
            </h2>
            <div className="mb-4 whitespace-pre-wrap text-left">
              <ReactMarkdown>
                {popupContent === "terms" ? termsContent : privacyContent}
              </ReactMarkdown>
            </div>
            <button
              onClick={handlePopupClose}
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div
        className={`flex items-center justify-between min-h-screen bg-[#1a1a1a] text-white ${
          showPopup ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <ToastContainer position="top-center" />

        <form
          onSubmit={handleRegister}
          className="w-2/3 min-w-md p-8 rounded-lg shadow-md flex items-center justify-center"
        >
          <div className="max-w-md flex flex-col">
            <h2 className="text-4xl font-bold mb-2 text-center">
              Create an account
            </h2>
            <label>Enter your details to sign up</label>
            <div className="my-4">
              <label
                htmlFor="fullName"
                className="text-left block text-sm font-bold mb-2"
              >
                Full name *
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                placeholder="Example Ex"
                onChange={(e) => setFullName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#212121] leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-left text-sm font-bold mb-2"
              >
                E-mail *
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
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-left text-sm font-bold mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  type={passwordshow.type}
                  id="password"
                  value={password}
                  placeholder="************"
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#212121] leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
                <img
                  src={passwordshow.img}
                  className="w-5 absolute top-2 right-2 cursor-pointer"
                  id="icon1"
                  onClick={handlePassword}
                />
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-left text-sm font-bold mb-2"
              >
                Confirm password *
              </label>
              <input
                type={passwordshow.type}
                id="confirmPassword"
                value={confirmPassword}
                placeholder="************"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-[#212121] leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="flex items-start mb-4">
              <input
                type="checkbox"
                id="terms"
                className="mr-2 leading-tight mt-1 ml-1 accent-orange-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-left">
                By checking this box, you agree to our{" "}
                <a
                  href="#"
                  className="text-orange-500 hover:text-orange-700"
                  onClick={handleTermsClick}
                >
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-orange-500 hover:text-orange-700"
                  onClick={handlePrivacyClick}
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            <label htmlFor="login" className="text-sm block mb-3 text-left">
              Have an account with us?{" "}
              <a
                href="/login"
                className="text-orange-500 hover:text-orange-700"
              >
                Sign in
              </a>
              .
            </label>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:bg-opacity-30 focus:outline-none focus:shadow-outline w-full"
              disabled={loading}
            >
              {loading ? "Signing up" : "Sign up"}
            </button>
          </div>
        </form>
        <img alt="nice pic" src={registerImage} className="w-1/3 h-screen " />
      </div>
    </div>
  );
}

export default Register;

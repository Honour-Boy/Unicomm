import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../components/Firebase/firebase"; // Ensure firebase.js is correctly configured
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { where, query } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import languages from "../components/Common/Languages";
import "react-toastify/dist/ReactToastify.css";
import useUserStore from "../components/Firebase/userStore";

const Profile = () => {
  const [section, setSection] = useState(0);
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("");
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useUserStore();

  const handleNext = () => {
    setSection((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setSection((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    // Ensure username starts with "@"
    if (!username.startsWith("@")) {
      toast.error('Username must start with "@"');
      return;
    }
    setLoading(true);
    // Check if the username is unique
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      toast.warn("Select another username");
      return;
    }

    try {
      const userProfile = {
        username,
        language,
        dob,
        bio,
        gender,
        organization,
        jobTitle,
      };

      await setDoc(doc(db, "users", user.uid), userProfile, { merge: true });

      toast.success("Profile created successfully!");
      setTimeout(() => {
        // Check if the user is already logged in
        const token = localStorage.getItem("authToken");
        console.log("Token:", token);
        if (token || currentUser) {
          navigate("/chat");
        } else {
          navigate("/login");
        }
      }, 3000);
    } catch (error) {
      console.error("Profile creation error:", error.message);
      toast.error("Profile creation failed. Please try again.");
    }
  };

  const renderSection = () => {
    switch (section) {
      case 0:
        return (
          <div>
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2 text-left"
                htmlFor="username"
              >
                Username *
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@ex123"
                className="w-full py-2 px-3 bg-[#212121] border border-gray-400 text-white rounded"
                required
              />
            </div>
            <div className="mb-4 date-picker-container">
              <label
                className="block text-sm font-bold mb-2 text-left"
                htmlFor="dob"
              >
                Date of Birth *
              </label>
              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full py-2 px-3 bg-[#212121] border border-gray-400 text-white rounded accent-white calendar-icon-white"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2 text-left"
                htmlFor="bio"
              >
                Bio *
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full py-2 px-3 bg-[#212121] border border-gray-400 text-white rounded max-h-24 resize-none"
                required
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2 text-left"
                htmlFor="gender"
              >
                Gender *
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full py-2 px-3 bg-[#212121] border border-gray-400 text-white rounded"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2 text-left"
                htmlFor="language"
              >
                Language Preferences *
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full py-2 px-3 bg-[#212121] border border-gray-400 text-white rounded"
                required
              >
                <option value="">Select Language</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2 text-left"
                htmlFor="organization"
              >
                Organization *
              </label>
              <input
                type="text"
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full py-2 px-3 bg-[#212121] border border-gray-400 text-white rounded"
                required
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-sm font-bold mb-2 text-left"
                htmlFor="jobTitle"
              >
                Job Title *
              </label>
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full py-2 px-3 bg-[#212121] border border-gray-400 text-white rounded"
                required
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-20 items-center min-h-screen bg-[#1a1a1a] text-white">
      <ToastContainer position="top-center" />
      <h1 className="text-5xl font-bold mb-4">Set up your Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="w-1/2 min-w-md p-8 rounded-lg shadow-md bg-[#2d2d2d] border border-[#424141]"
      >
        <div
          className={`${
            section === 0 ? "translate-x-0" : "-translate-x-screen"
          }`}
        >
          {renderSection()}
        </div>
        <div className="flex justify-between mt-6">
          {section > 0 ? (
            <button
              type="button"
              onClick={handlePrevious}
              className="py-2 px-4 bg-orange-600 hover:bg-orange-800 rounded-md text-white"
            >
              {"<"} Previous
            </button>
          ) : (
            <span></span>
          )}
          {section < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2 px-4 bg-orange-600 hover:bg-orange-800 rounded-md text-white"
            >
              Next {">"}
            </button>
          ) : (
            <button
              type="submit"
              className="py-2 px-4 bg-orange-600 hover:bg-orange-800 rounded-md text-white"
              disabled={loading}
            >
              {loading ? "Creating Profile..." : "Submit"}
            </button>
          )}
        </div>
      </form>
      <style>
        {`
          .calendar-icon-white::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
        `}
      </style>
    </div>
  );
};

export default Profile;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Intro from "./pages/Intro";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/CreateProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ChatRoom from "./pages/ChatRoom";
import NotFound from "./pages/NotFound";
import PrivateRouter from "./components/Routers/PrivateRouter";
import PublicRouter from "./components/Routers/PublicRouter";
import { useEffect } from "react";
import { auth } from "./components/Firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import useUserStore from "./components/Firebase/userStore";
import "./styles/App.css";
import LoadingSpinner from "./components/Common/LoadingComponent";

function App() {
  const { isLoading, fetchUserInfo } = useUserStore();
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user.uid);
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  return (
    <Router>
      <div className="max-h-screen max-w-screen">
        <Routes>
          <Route
            path="/"
            element={
              <PublicRouter>
                <Intro />
              </PublicRouter>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRouter>
                <Login />
              </PublicRouter>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRouter>
                <Register />
              </PublicRouter>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRouter>
                <ForgotPassword />
              </PublicRouter>
            }
          />
          <Route
            path="/create-profile"
            element={
              <PublicRouter>
                <Profile />
              </PublicRouter>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRouter>
                {isLoading ? (
                  <div className="flex items-center justify-center bg-[#1a1a1a] w-screen h-screen text-white flex-col gap-2">
                    <LoadingSpinner />
                    Loading...
                  </div>
                ) : (
                  <ChatRoom />
                )}
              </PrivateRouter>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { useNavigate } from "react-router-dom";
import { app,step1,step2,step3 } from "../assets";

function Intro() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/chat");
  };
  const handleLogin = () => {
    navigate("/login");
  };
  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col items-center overflow-auto scrollbar-hide">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4">
        <h1 className="text-4xl font-bold ml-10">UNICOMM</h1>
        <div className="mr-10">
          <button
            onClick={handleLogin}
            className="bg-white text-black px-6 py-3 rounded-xl mr-4 hover:bg-gray-300 focus:outline-none"
          >
            Login
          </button>
          <button
            onClick={handleRegister}
            className="bg-orange-500 px-6 py-3 rounded-xl hover:bg-orange-700 focus:outline-none"
          >
            Signup
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center mt-40">
        <h2 className="text-6xl font-bold">
          Break Language Barriers Instantly
        </h2>
        <div className="mt-6 flex justify-center items-center">
          <input
            type="text"
            placeholder="Enter your message"
            className="px-6 py-3 rounded-l-lg text-black w-80 focus:outline-none"
          />
          <button className="bg-gray-500 px-6 py-3 rounded-r-xl hover:bg-gray-700 focus:outline-none" onClick={handleNavigate}>
            Translate
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="mt-16 w-4/5">
        <hr className="mb-4 border-[#2a2a2a]" />
        <span className="">
          <h2 className="text-4xl font-bold text-left">How UniComm Works</h2>
        </span>
        <hr className="my-6 border-[#2a2a2a]" />

        <div className="flex justify-around mt-8">
          <div className=" w-96 text-left text-wrap border-r-2 border-[#2a2a2a]">
            <img src={step1} className="w-40 h-40  rounded-full ml-20" />
            <h4 className="text-2xl font-semibold mt-4">Step 1</h4>
            <p className="w-4/5">
              Type your message. UniComm instantly translates it to the
              recipient's language.
            </p>
          </div>
          <div className="w-96 text-left text-wrap border-r-2 border-[#2a2a2a]">
            <img src={step2} className="w-64 h-40  rounded-full ml-20" />
            <h4 className="text-2xl font-semibold mt-4">Step 2</h4>
            <p className="w-4/5">
              Communicate effortlessly in any language with real-time
              translations.
            </p>
          </div>
          <div className="w-96 text-left text-wrap">
            <img src={step3} className="w-40 h-40  rounded-full ml-20" />
            <h4 className="text-2xl font-semibold mt-4">Step 3</h4>
            <p className="w-4/5">
              Start chatting with our AI-powered translation feature for
              seamless conversations.
            </p>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="mt-16 text-left w-4/5">
        <hr className="mb-4 border-[#2a2a2a]" />
        <span className="">
          <h2 className="text-4xl font-bold text-left">Download UniComm App</h2>
        </span>
        <hr className="my-6 border-[#2a2a2a]" />
        <div className="flex items-center justify-between w-4/5 h-80">
          <span>
            <h3 className="text-3xl font-semibold">Start Messaging</h3>
            <p className="mt-4 text-wrap w-3/5">
              Experience seamless multilingual communication with UniComm.
              Connect with ease across languages.
            </p>
            <button className="mt-6 bg-orange-500 px-6 py-3 rounded-xl hover:bg-orange-700 focus:outline-none">
              Get App
            </button>
          </span>
          <span>
            <img src={app} className="w-80 h-80 mt-8" />
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 w-full bg-gray-900 text-white py-8 text-left flex gap-10 justify-between items-center">
        <h4 className="font-bold ml-16 text-xl">UNICOMM BRANDING</h4>
        <div className="mt-4 grid grid-cols-3 gap-8 text-md mr-24">
          <div>
            <p>Multilingual</p>
            <p>Translation</p>
            <p>Twitter</p>
            <p>Facebook</p>
          </div>
          <div>
            <p>Get Started</p>
            <p>Collaborate with us</p>
            <p>Integrate your app</p>
            <p>Join our team</p>
          </div>
          <div>
            <p>Read Updates</p>
            <p>Purchase Subscription</p>
            <p>Explore Features</p>
            <p>Special Offer</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add this CSS to hide the scrollbar
const style = document.createElement('style');
style.innerHTML = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;
document.head.appendChild(style);

export default Intro;

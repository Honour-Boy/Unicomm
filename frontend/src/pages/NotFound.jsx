import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-white text-center">
      <div>
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page Not Found</p>
        <button
          onClick={handleGoHome}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;

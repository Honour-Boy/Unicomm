import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../components/Firebase/firebase';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent successfully.');
            setTimeout(() => {
                navigate("/login");
                window.location.reload();
              }, 3000);
        } catch (error) {
            toast.error('Failed to send password reset email. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] flex flex-col justify-center">
        <ToastContainer />
            <div className="max-w-md w-full mx-auto bg-[#353535] p-8 rounded-lg border border-[#848484]">
                <h1 className="text-4xl font-bold text-white text-center mb-5">Forgot Password?</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-200 text-left block">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-2 mt-2 border border-[#4b4b4b] bg-[#212121] text-white"
                            placeholder='Enter Email.'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-800 rounded-md text-white">Reset Password</button>
                    </div>
                </form>
                <div className="mt-6 text-white text-center">
                    <p>
                        Remember your password? <Link to="/login" className="text-orange-500 hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

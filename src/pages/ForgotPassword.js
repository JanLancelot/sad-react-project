import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ErrorMessage = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
    <p>{message}</p>
  </div>
);

const SuccessMessage = ({ message }) => (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
    <p>{message}</p>
  </div>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent. Please check your inbox.");
      setTimeout(() => navigate("/signin"), 5000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-24 w-auto"
            src="https://dyci.edu.ph/img/DYCI.png"
            alt="DYCI LOGO"
          />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Reset your password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message={success} />}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                      error ? "ring-red-300 focus:ring-red-500" : "ring-gray-300 focus:ring-indigo-600"
                    } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

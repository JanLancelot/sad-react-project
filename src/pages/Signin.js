import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  setDoc,
  collection,
} from "firebase/firestore";

const signInUser = async (email, password, navigate) => {
  const auth = getAuth();

  const isAccountLocked = await checkAndLockUserAccount(email);
  if (isAccountLocked) {
    throw new Error(
      "Your account is currently locked. Please contact support."
    );
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User signed in:", user);

    await checkAndLockUserAccount(email, false, 0);

    navigate("/dashboard");
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error:", errorCode, errorMessage);

    await checkAndLockUserAccount(email, true);
    throw new Error(errorMessage);
  }
};

const checkAndLockUserAccount = async (
  email,
  incrementFailedAttempts = false,
  resetFailedAttempts = null
) => {
  const db = getFirestore();
  const userRef = doc(db, "users", email);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      const failedAttempts = userData.failedAttempts || 0;
      const locked = userData.locked || false;

      if (locked) {
        return true;
      }

      if (incrementFailedAttempts) {
        if (failedAttempts >= 3) {
          await updateDoc(querySnapshot.docs[0].ref, {
            locked: true,
            failedAttempts: 0,
          });
          console.log(`Account for ${email} has been locked.`);
          return true;
        } else {
          await updateDoc(querySnapshot.docs[0].ref, {
            failedAttempts: failedAttempts + 1,
          });
          console.log(
            `Failed login attempt for ${email}. Attempts: ${failedAttempts + 1}`
          );
          return false;
        }
      } else if (resetFailedAttempts !== null) {
        await updateDoc(querySnapshot.docs[0].ref, {
          failedAttempts: resetFailedAttempts,
        });
        console.log(
          `Failed login attempts for ${email} have been reset to ${resetFailedAttempts}.`
        );
        return false;
      } else {
        return false;
      }
    } else {
      await setDoc(userRef, { failedAttempts: 1 });
      console.log(
        `Account for ${email} has been created with 1 failed attempt.`
      );
      return false;
    }
  } else {
    const userData = userSnapshot.data();
    const failedAttempts = userData.failedAttempts || 0;
    const locked = userData.locked || false;

    if (locked) {
      return true;
    }

    if (incrementFailedAttempts) {
      // Formerly 2
      if (failedAttempts >= 3) {
        await updateDoc(userRef, { locked: true, failedAttempts: 0 });
        console.log(`Account for ${email} has been locked.`);
        return true;
      } else {
        await updateDoc(userRef, { failedAttempts: failedAttempts + 1 });
        console.log(
          `Failed login attempt for ${email}. Attempts: ${failedAttempts + 1}`
        );
        return false;
      }
    } else if (resetFailedAttempts !== null) {
      await updateDoc(userRef, { failedAttempts: resetFailedAttempts });
      console.log(
        `Failed login attempts for ${email} have been reset to ${resetFailedAttempts}.`
      );
      return false;
    } else {
      return false;
    }
  }
};

const ErrorMessage = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
    <p>{message}</p>
  </div>
);

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting form");
    try {
      await signInUser(email, password, navigate);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center">
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-24 w-auto"
              src="https://dyci.edu.ph/img/DYCI.png"
              alt="DYCI LOGO"
            />
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
              {error && <ErrorMessage message={error} />}
              <form
                className="space-y-6"
                action="#"
                method="POST"
                onSubmit={handleSubmit}
              >
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
                        error
                          ? "ring-red-300 focus:ring-red-500"
                          : "ring-gray-300 focus:ring-indigo-600"
                      } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                        error
                          ? "ring-red-300 focus:ring-red-500"
                          : "ring-gray-300 focus:ring-indigo-600"
                      } placeholder:text-gray-400 sm:text-sm sm:leading-6`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Sign in
                  </button>
                </div>
                <p className="mt-2 text-center text-sm text-gray-600">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

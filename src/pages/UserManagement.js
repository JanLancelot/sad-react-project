import React, { useState, useEffect, Fragment } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { updatePassword } from "firebase/auth";
import { Dialog, Transition } from "@headlessui/react";
import Layout from "./Layout";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userIdToUpdate, setUserIdToUpdate] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [dialogError, setDialogError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollectionRef);
        const fetchedUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLockAccount = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { locked: true });

      // Update the user state locally to reflect the change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, locked: true } : user
        )
      );
    } catch (error) {
      console.error("Error locking account:", error);
      // Handle the error appropriately, e.g., display an error message
    }
  };

  const handleUnlockAccount = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { locked: false });

      // Update the user state locally to reflect the change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, locked: false } : user
        )
      );
    } catch (error) {
      console.error("Error unlocking account:", error);
      // Handle the error appropriately, e.g., display an error message
    }
  };

  const handleResetPassword = async (userId) => {
    setUserIdToUpdate(userId);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewPassword("");
    setDialogError(null); // Clear the dialog error
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordReset = async () => {
    try {
      // Get the user object from Firebase Authentication using the UID
      const user = await auth.getUser(userIdToUpdate);

      // Update the user's password
      await updatePassword(user, newPassword);

      // Close the dialog
      handleDialogClose();
      // Handle successful password reset (e.g., display a success message)
      console.log("Password reset for user:", userIdToUpdate);
    } catch (error) {
      console.error("Error resetting password:", error);
      setDialogError(error.message); // Set the error message from Firebase
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 font-bold">{error}</div>
      </div>
    );
  }

  const lockedUsers = users.filter((user) => user.locked);
  const normalUsers = users.filter((user) => !user.locked);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold mb-4">User Management</h2>

        {/* Locked Accounts */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Locked Accounts</h3>
          <ul className="list-disc">
            {lockedUsers.map((user) => (
              <li key={user.id} className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{user.fullName}</span>
                  <div>
                    <button
                      className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      onClick={() => handleUnlockAccount(user.id)}
                    >
                      Unlock
                    </button>
                    <button
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Normal Accounts */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Normal Accounts</h3>
          <ul className="list-disc">
            {normalUsers.map((user) => (
              <li key={user.id} className="mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{user.fullName}</span>
                  <div>
                    <button
                      className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => handleLockAccount(user.id)}
                    >
                      Lock
                    </button>
                    <button
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Transition show={isDialogOpen} as={Fragment}>
          <Dialog
            open={isDialogOpen}
            onClose={handleDialogClose}
            className="fixed z-10 inset-0 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
              </Transition.Child>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all">
                  <div className="px-6 py-4">
                    <Dialog.Title className="text-lg font-medium text-gray-900">
                      Reset Password
                    </Dialog.Title>
                    {dialogError && (
                      <div className="mt-2 text-red-500">{dialogError}</div>
                    )}
                    <input
                      type="password"
                      className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button
                      type="button"
                      className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={handleConfirmPasswordReset}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={handleDialogClose}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Layout>
  );
};

export default UserManagement;

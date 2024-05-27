import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; 
import { updatePassword } from 'firebase/auth'; 
import Modal from 'react-modal'; 

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userIdToUpdate, setUserIdToUpdate] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [modalError, setModalError] = useState(null); // Modal error state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);
        const fetchedUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLockAccount = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { locked: true });

      // Update the user state locally to reflect the change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, locked: true } : user
        )
      );
    } catch (error) {
      console.error('Error locking account:', error);
      // Handle the error appropriately, e.g., display an error message
    }
  };

  const handleUnlockAccount = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { locked: false });

      // Update the user state locally to reflect the change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, locked: false } : user
        )
      );
    } catch (error) {
      console.error('Error unlocking account:', error);
      // Handle the error appropriately, e.g., display an error message
    }
  };

  const handleResetPassword = async (userId) => {
    setUserIdToUpdate(userId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewPassword('');
    setModalError(null); // Clear the modal error
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordReset = async () => {
    try {
      // Get the user object from Firebase Authentication using the UID
      const userRef = await auth.getUser(userIdToUpdate);
      const user = userRef.get();
  
      // Update the user's password
      await updatePassword(user, newPassword);
  
      // Close the modal
      handleModalClose();
      // Handle successful password reset (e.g., display a success message)
      console.log("Password reset for user:", userIdToUpdate);
    } catch (error) {
      console.error('Error resetting password:', error);
      setModalError(error.message); // Set the error message from Firebase
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
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
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
                    onClick={() => handleUnlockAccount(user.id)}
                  >
                    Unlock
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none ml-2"
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
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                    onClick={() => handleLockAccount(user.id)}
                  >
                    Lock
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none ml-2"
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        contentLabel="Reset Password"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
        {modalError && <div className="mb-4 text-red-500">{modalError}</div>}
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">New Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPassword}
            onChange={handleNewPasswordChange}
          />
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none mr-2"
            onClick={handleModalClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
            onClick={handleConfirmPasswordReset}
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
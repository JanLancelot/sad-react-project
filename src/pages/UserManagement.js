import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Assuming you have firebaseConfig set up

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch (error) {
      console.error('Error locking account:', error);
      // Handle the error appropriately, e.g., display an error message
    }
  };

  const handleUnlockAccount = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { locked: false });
    } catch (error) {
      console.error('Error unlocking account:', error);
      // Handle the error appropriately, e.g., display an error message
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      // Implement logic to reset the password for the user
      // This might involve sending an email with a password reset link
      // or using Firebase Authentication's password reset functionality.
      // ...
    } catch (error) {
      console.error('Error resetting password:', error);
      // Handle the error appropriately, e.g., display an error message
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
                <span className="text-lg font-medium">{user.name}</span>
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
                <span className="text-lg font-medium">{user.name}</span>
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
    </div>
  );
};

export default UserManagement;
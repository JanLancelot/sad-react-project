import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Layout from "./Layout";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, locked: true } : user
        )
      );
    } catch (error) {
      console.error("Error locking account:", error);
    }
  };

  const handleUnlockAccount = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { locked: false });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, locked: false } : user
        )
      );
    } catch (error) {
      console.error("Error unlocking account:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold">Loading...</div>
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
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold mb-6">User Management</h2>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Locked Accounts</h3>
          <ul className="list-disc pl-5 space-y-4">
            {lockedUsers.map((user) => (
              <li key={user.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{user.fullName}</span>
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={() => handleUnlockAccount(user.id)}
                  >
                    Unlock
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4">Normal Accounts</h3>
          <ul className="list-disc pl-5 space-y-4">
            {normalUsers.map((user) => (
              <li key={user.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{user.fullName}</span>
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => handleLockAccount(user.id)}
                  >
                    Lock
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagement;

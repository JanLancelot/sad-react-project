import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; 
import { updatePassword } from 'firebase/auth'; 
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// Import MUI styles
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userIdToUpdate, setUserIdToUpdate] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [dialogError, setDialogError] = useState(null); // Dialog error state

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
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewPassword('');
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
      console.error('Error resetting password:', error);
      setDialogError(error.message); // Set the error message from Firebase
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
    <ThemeProvider theme={theme}>
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
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleUnlockAccount(user.id)}
                    >
                      Unlock
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleResetPassword(user.id)}
                      className="ml-2"
                    >
                      Reset Password
                    </Button>
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
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleLockAccount(user.id)}
                    >
                      Lock
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleResetPassword(user.id)}
                      className="ml-2"
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Dialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          aria-labelledby="reset-password-dialog-title"
          aria-describedby="reset-password-dialog-description"
        >
          <DialogTitle id="reset-password-dialog-title">Reset Password</DialogTitle>
          <DialogContent>
            {dialogError && (
              <DialogContentText color="error">{dialogError}</DialogContentText>
            )}
            <TextField
              autoFocus
              margin="dense"
              id="new-password"
              label="New Password"
              type="password"
              fullWidth
              variant="standard"
              value={newPassword}
              onChange={handleNewPasswordChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleConfirmPasswordReset} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default UserManagement;
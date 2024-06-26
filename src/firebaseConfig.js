import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBGgDfbFCV5JpBa5frmdT2updCFKV9vkKI",
    authDomain: "sad-react-project.firebaseapp.com",
    projectId: "sad-react-project",
    storageBucket: "sad-react-project.appspot.com",
    messagingSenderId: "712598055720",
    appId: "1:712598055720:web:8ff74d9291465f6812be1d"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC41IobINiDAxPS1cM3rBfvtchSN4uymc",
  authDomain: "driver-form-test.firebaseapp.com",
  projectId: "driver-form-test",
  storageBucket: "driver-form-test.appspot.com",
  messagingSenderId: "182444634610",
  appId: "1:182444634610:web:34c867c8c6b6ef98797b6b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

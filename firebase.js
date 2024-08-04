// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfQOpZynRhC_ijkAEanD-JZx8Zc9gqFYQ",
  authDomain: "inventory-management-552ef.firebaseapp.com",
  projectId: "inventory-management-552ef",
  storageBucket: "inventory-management-552ef.appspot.com",
  messagingSenderId: "534729877870",
  appId: "1:534729877870:web:bd4488c3209b71a653397f",
  measurementId: "G-SJ9EES4CQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};
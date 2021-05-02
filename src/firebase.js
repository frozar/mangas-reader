import firebase from "firebase/app";
import "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnqdKNJhMXzdH_9xzpOx1LIITcVKTy8js",
  authDomain: "manga-b8fb3.firebaseapp.com",
  databaseURL: "https://manga-b8fb3.firebaseio.com",
  projectId: "manga-b8fb3",
  storageBucket: "manga-b8fb3.appspot.com",
  messagingSenderId: "266094841766",
  appId: "1:266094841766:web:67abf73e5a959ec0b14967",
  measurementId: "G-1X3975D4XF",
};

// Initialize Firebase or get the available instance (hot reload stuff)
export default !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

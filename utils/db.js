import firebase from "./firebase";
import "firebase/firestore";

export const db = firebase.firestore();

// console.log("GLOBAL UTILS/DB.JS: db", db);

// export const LOCAL_ADDRESS = "192.168.1.89";
export const LOCAL_ADDRESS = "192.168.1.19";
// export const LOCAL_ADDRESS = "192.168.30.137";

const useLocalDB = false;
if (useLocalDB) {
  db.useEmulator(LOCAL_ADDRESS, 8080);
}

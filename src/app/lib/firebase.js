import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);





// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBeyxWlJ2Yl81Sm0G0oWoQhnQkkgmmcojY",
//   authDomain: "interview-mate-d6a8c.firebaseapp.com",
//   projectId: "interview-mate-d6a8c",
//   storageBucket: "interview-mate-d6a8c.firebasestorage.app",
//   messagingSenderId: "751405935672",
//   appId: "1:751405935672:web:aa45d53b6de2299bc60acd"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
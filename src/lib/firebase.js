import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBeyxWlJ2Yl81Sm0G0oWoQhnQkkgmmcojY",
  authDomain: "interview-mate-d6a8c.firebaseapp.com",
  projectId: "interview-mate-d6a8c",
  storageBucket: "interview-mate-d6a8c.firebasestorage.app",
  messagingSenderId: "751405935672",
  appId: "1:751405935672:web:aa45d53b6de2299bc60acd"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);


export default app;
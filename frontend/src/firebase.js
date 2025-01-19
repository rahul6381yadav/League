import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDXouP2ilAdivWOVOA6LiC0DeQaC3FzXUA",
    authDomain: "leaderboard-77fbb.firebaseapp.com",
    projectId: "leaderboard-77fbb",
    storageBucket: "leaderboard-77fbb.firebasestorage.app",
    messagingSenderId: "156673424761",
    appId: "1:156673424761:web:d75faaead55dbabf3f43a8"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
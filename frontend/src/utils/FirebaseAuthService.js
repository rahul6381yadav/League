import { 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    setPersistence, 
    browserLocalPersistence 
} from 'firebase/auth';

import { auth } from '../firebase';

export const loginWithEmail = async (email, password) => {
    try {
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message || 'An error occurred' };
    }
};

export const loginWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await setPersistence(auth, browserLocalPersistence);
        const userCredential = await signInWithPopup(auth, provider);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message || 'An error occurred' };
    }
};

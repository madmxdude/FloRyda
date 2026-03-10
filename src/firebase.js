import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const provider = new GoogleAuthProvider();

export const OperationType = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LIST: 'list',
    GET: 'get',
    WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
    const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            providerInfo: auth.currentUser?.providerData.map(p => ({
                providerId: p.providerId,
                displayName: p.displayName,
                email: p.email
            })) || []
        },
        operationType,
        path
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}

export const login = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        // Save user profile
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            lastActive: new Date().toISOString()
        }, { merge: true });
        return user;
    } catch (error) {
        console.error('Login failed:', error);
        return null;
    }
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export const saveScore = async (trackId, score) => {
    if (!auth.currentUser) return;
    const path = 'scores';
    try {
        await addDoc(collection(db, path), {
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName,
            trackId,
            score,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
    }
};

export const getLeaderboard = async (trackId) => {
    const path = 'scores';
    try {
        const q = query(
            collection(db, path),
            where('trackId', '==', trackId),
            orderBy('score', 'desc'),
            limit(10)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
    }
};

export { auth, db };

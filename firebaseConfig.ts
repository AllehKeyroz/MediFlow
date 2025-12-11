import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// INSTRUÇÕES:
// Substitua o objeto abaixo pelas credenciais do seu projeto Firebase.
// Você encontra isso em: Project Settings > General > Your apps
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyBvFowGxEqmAzcQMrGQqNqg_cb4xay45Ug",
  authDomain: "analise-de-projeto.firebaseapp.com",
  projectId: "analise-de-projeto",
  storageBucket: "analise-de-projeto.firebasestorage.app",
  messagingSenderId: "733196870904",
  appId: "1:733196870904:web:13a4d9c2d58da29a7bc70d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
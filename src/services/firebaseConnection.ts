import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDc85ZNMqsW8LJ7sDdZ2eendtD9xRf1T7U",
  authDomain: "tarefasmais-e64d2.firebaseapp.com",
  projectId: "tarefasmais-e64d2",
  storageBucket: "tarefasmais-e64d2.appspot.com",
  messagingSenderId: "282590671394",
  appId: "1:282590671394:web:d1f9e6491805979c28907b",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// TODO: Replace with your actual Firebase config values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db;

async function getRoutineData() {
  const docRef = doc(db, "shared", "routineData");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveRoutineData(data) {
  const docRef = doc(db, "shared", "routineData");
  await setDoc(docRef, data);
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await getRoutineData();
  document.getElementById("app").innerHTML = `
    <h1>Synced Routines</h1>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
});

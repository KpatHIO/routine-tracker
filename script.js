import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA4Y98NiC1XCveZ-wBS3BsKvF8VfFXloI",
  authDomain: "routinetracker-3e465.firebaseapp.com",
  projectId: "routinetracker-3e465",
  storageBucket: "routinetracker-3e465.appspot.com",
  messagingSenderId: "387314062824",
  appId: "1:387314062824:web:898af34ecea35f44aa805d"
};

// ✅ This is the correct order:
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);        // ✅ define db
window.db = db;                      // ✅ then assign it globally
 

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

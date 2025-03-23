
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA4Y98NiC1XCveZ-wBS3BsKvF8VfFXloI",
  authDomain: "routinetracker-3e465.firebaseapp.com",
  projectId: "routinetracker-3e465",
  storageBucket: "routinetracker-3e465.appspot.com",
  messagingSenderId: "387314062824",
  appId: "1:387314062824:web:898af34ecea35f44aa805d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getRoutineData() {
  const docRef = doc(db, "shared", "routineData");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

function renderTasks(tasks) {
  const list = tasks.map(task => `<li>${task}</li>`).join("");
  return `<ul class="task-list">${list}</ul>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  const data = await getRoutineData();
  const jayMondayTasks = (data?.Jay?.Monday) || [];

  app.innerHTML = `
    <h1>Jay's Monday Routine</h1>
    ${renderTasks(jayMondayTasks)}
  `;
});

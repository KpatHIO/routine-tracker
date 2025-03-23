
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

const kids = ["Jay", "Casey", "Milly"];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function getDocData(collection, document) {
  const docRef = doc(db, collection, document);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function setDocData(collection, document, data) {
  const docRef = doc(db, collection, document);
  await setDoc(docRef, data);
}

const getRoutineData = () => getDocData("shared", "routineData");
const saveRoutineData = (data) => setDocData("shared", "routineData", data);
const getProgressData = () => getDocData("shared", "progressData");
const saveProgressData = (data) => setDocData("shared", "progressData", data);
const getUserStats = () => getDocData("shared", "userStats");
const saveUserStats = (data) => setDocData("shared", "userStats", data);
const getAvatars = () => getDocData("shared", "avatars");
const saveAvatars = (data) => setDocData("shared", "avatars", data);
const getRewards = async () => {
  const result = await getDocData("shared", "rewards");
  return Array.isArray(result.list) ? result.list : [];
};
const saveRewards = (data) => setDocData("shared", "rewards", { list: data });

function renderProfileDashboard(avatars) {
  const el = document.getElementById("app");
  el.innerHTML = `
    <h2>Who's checking in?</h2>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${kids.map(name => `
        <button style="font-size:1.5em; padding:15px;" onclick="window.loadChildView('${name}')">
          ${avatars[name] || "👤"} ${name}
        </button>
      `).join("")}
    </div>
    <br>
    <button style="font-size:0.9em; opacity:0.7;" onclick="window.loadParentDashboard()">Parent Mode</button>
  `;
}

window.loadDashboard = async function () {
  const avatars = await getAvatars();
  renderProfileDashboard(avatars);
};

window.loadParentDashboard = async function () {
  const el = document.getElementById("app");
  const routines = await getRoutineData();
  const avatars = await getAvatars();
  const rewards = await getRewards();
  const avatarOptions = ["🐶", "🐱", "🦊", "🐸", "🐵", "🦁", "🐯", "🐼", "🐷", "🐨", "🦄"];

  el.innerHTML = `
    <h2>Parent Dashboard</h2>
    ${kids.map(kid => `
      <h3>${avatars[kid] || "👤"} ${kid}</h3>
      ${weekdays.map(day => `
        <div>
          <strong>${day}:</strong><br>
          <input type="text" id="${kid}_${day}" value="${(routines[kid]?.[day] || []).join(', ')}" style="width:100%;" />
        </div>
      `).join("")}
      <div>
        <label>Avatar:</label><br>
        ${avatarOptions.map(a => `
          <button onclick="window.updateAvatar('${kid}', '${a}')">${a}</button>
        `).join(" ")}
      </div>
    `).join("")}
    <hr><h3>Rewards</h3>
    <ul id="rewardList">
      ${rewards.map((r, i) => `
        <li>
          <input id="reward_name_${i}" value="${r.name}" style="width:40%"/> -
          <input id="reward_cost_${i}" value="${r.cost}" type="number" style="width:60px"/> pts
          <button onclick="window.updateReward(${i})">💾</button>
        </li>
      `).join("")}
    </ul>
    <input type="text" id="rewardName" placeholder="Reward Name" />
    <input type="number" id="rewardCost" placeholder="Points Cost" />
    <button onclick="window.addReward()">Add Reward</button>
    <br><br>
    <button onclick="window.saveParentRoutines()">Save Routines</button>
    <button onclick="window.loadDashboard()">Back</button>
  `;
};

window.updateAvatar = async function (name, emoji) {
  const avatars = await getAvatars();
  avatars[name] = emoji;
  await saveAvatars(avatars);
  window.loadParentDashboard();
};

window.addReward = async function () {
  const inputName = document.getElementById("rewardName");
  const inputCost = document.getElementById("rewardCost");
  const nameVal = inputName?.value.trim();
  const costVal = parseInt(inputCost?.value.trim(), 10);
  if (!nameVal || isNaN(costVal)) {
    alert("Please enter valid reward details.");
    return;
  }
  const rewards = await getRewards();
  rewards.push({ name: nameVal, cost: costVal });
  await saveRewards(rewards);
  inputName.value = "";
  inputCost.value = "";
  alert("Reward added!");
  await window.loadParentDashboard();
};

window.updateReward = async function(index) {
  const rewards = await getRewards();
  const name = document.getElementById(`reward_name_${index}`).value.trim();
  const cost = parseInt(document.getElementById(`reward_cost_${index}`).value.trim(), 10);
  if (!name || isNaN(cost)) {
    alert("Please enter valid name and cost.");
    return;
  }
  rewards[index] = { name, cost };
  await saveRewards(rewards);
  alert("Reward updated!");
  window.loadParentDashboard();
};

window.saveParentRoutines = async function () {
  const data = {};
  kids.forEach(kid => {
    data[kid] = {};
    weekdays.forEach(day => {
      const value = document.getElementById(`${kid}_${day}`).value;
      data[kid][day] = value.split(',').map(t => t.trim()).filter(Boolean);
    });
  });
  await saveRoutineData(data);
  alert("Routines saved!");
};

document.addEventListener("DOMContentLoaded", window.loadDashboard);


// Firebase imports and config (adjust these with your own config if needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4Y9BniC1XCveZ-wBS3BsKvF8VFffXloI",
  authDomain: "routinetracker-3e465.firebaseapp.com",
  projectId: "routinetracker-3e465",
  storageBucket: "routinetracker-3e465.firebasestorage.app",
  messagingSenderId: "387314062824",
  appId: "1:387314062824:web:898af34ecea35f44aa805d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db;

// Utility functions
async function getRoutineData() {
  const docRef = doc(db, "shared", "routineData");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveRoutineData(data) {
  await setDoc(doc(db, "shared", "routineData"), data);
}

async function getProgressData() {
  const docRef = doc(db, "shared", "progress");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveProgressData(data) {
  await setDoc(doc(db, "shared", "progress"), data);
}

async function getUserStats() {
  const docRef = doc(db, "shared", "userStats");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveUserStats(data) {
  await setDoc(doc(db, "shared", "userStats"), data);
}

async function getRewards() {
  const docRef = doc(db, "shared", "rewards");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().list || [] : [];
}

async function saveRewards(list) {
  await setDoc(doc(db, "shared", "rewards"), { list });
}

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

window.loadDashboard = function () {
  const el = document.getElementById("app");
  el.innerHTML = `
    <h2>Who's checking in?</h2>
    <div class="avatar-dashboard">
      <button class="avatar-button" onclick="window.loadChildView('Jay')">
        <img src="https://api.dicebear.com/6.x/thumbs/svg?seed=Jay" alt="Jay" />
        <span>Jay</span>
      </button>
      <button class="avatar-button" onclick="window.loadChildView('Casey')">
        <img src="https://api.dicebear.com/6.x/thumbs/svg?seed=Casey" alt="Casey" />
        <span>Casey</span>
      </button>
      <button class="avatar-button" onclick="window.loadChildView('Milly')">
        <img src="https://api.dicebear.com/6.x/thumbs/svg?seed=Milly" alt="Milly" />
        <span>Milly</span>
      </button>
    </div>
    <div style="text-align:center;">
      <button class="parent-button" onclick="window.loadParentDashboard()">Parent</button>
    </div>
  \`;
};

window.loadChildView = async function(name) {
  const el = document.getElementById("app");
  const today = new Date();
  let selectedDate = window.currentDate || today.toLocaleDateString('en-CA');

  const render = async () => {
    const routines = await getRoutineData();
    const progress = await getProgressData();
    const stats = await getUserStats();
    const rewards = await getRewards();
    const dayName = weekdays[new Date(selectedDate).getDay()];
    const tasks = routines[name]?.[dayName] || [];
    const key = name + "_" + selectedDate;
    const done = progress[key] || [];
    let currentStats = stats[name] || { points: 0, streak: 0, lastCompleted: "" };
    const isToday = selectedDate === today.toLocaleDateString('en-CA');

    const displayDate = new Date(selectedDate).toDateString();
    const streakLine = `<p>⭐ Points: ${currentStats.points} | 🔥 Streak: ${currentStats.streak} days</p>`;
    const rewardList = rewards.map(r => {
      const canRedeem = currentStats.points >= r.cost;
      return `<li>${r.name} - ${r.cost} pts ${canRedeem && isToday ? `<button onclick="window.redeemRewardChild('${name}', '${r.name}', ${r.cost})">Redeem</button>` : ""}</li>`;
    }).join("");

    el.innerHTML = `
      <h2><img src='https://api.dicebear.com/6.x/thumbs/svg?seed=${name}' alt='${name}' style='width:60px;height:60px;border-radius:50%;vertical-align:middle;margin-right:10px;'> ${name}'s Tasks for ${dayName}</h2>
      <div style="text-align:center;">
        <button onclick="window.changeDate('${name}', -1)">⬅️</button>
        <strong>${displayDate}</strong>
        <button onclick="window.changeDate('${name}', 1)">➡️</button>
      </div>
      ${isToday ? streakLine : ""}
      <ul class="task-list">
        ${tasks.map((task, i) => `
          <li>
            <input type="checkbox" id="task_${i}" ${done.includes(task) ? "checked" : ""} ${!isToday ? "disabled" : ""} onchange="window.toggleTask('${name}', '${selectedDate}', '${task}')">
            ${task}
          </li>
        `).join("")}
      </ul>
      <h3>🎁 Rewards</h3>
      <ul>${rewardList || "No rewards yet."}</ul>
      <button onclick="window.loadDashboard()">Back</button>
    `;

    window.currentChild = name;
    window.currentDate = selectedDate;
  };

  render();
};

window.changeDate = function(name, offset) {
  const newDate = new Date(window.currentDate);
  newDate.setDate(newDate.getDate() + offset);
  window.currentDate = newDate.toLocaleDateString('en-CA');
  window.loadChildView(name);
};

window.toggleTask = async function(name, date, task) {
  const progress = await getProgressData();
  const stats = await getUserStats();
  const key = name + "_" + date;
  if (!progress[key]) progress[key] = [];

  const done = progress[key];
  const isCompleted = done.includes(task);
  if (isCompleted) {
    progress[key] = done.filter(t => t !== task);
    stats[name].points = Math.max(0, (stats[name]?.points || 0) - 1);
  } else {
    progress[key].push(task);
    stats[name].points = (stats[name]?.points || 0) + 1;
  }

  await saveProgressData(progress);
  await saveUserStats(stats);
  window.loadChildView(name);
};

window.redeemRewardChild = async function(name, rewardName, cost) {
  const stats = await getUserStats();
  if ((stats[name]?.points || 0) < cost) {
    alert("Not enough points.");
    return;
  }
  stats[name].points -= cost;
  await saveUserStats(stats);
  alert(`${name} redeemed "${rewardName}"!`);
  window.loadChildView(name);
};

window.loadParentDashboard = async function () {
  const el = document.getElementById("app");
  const routines = await getRoutineData();
  const rewards = await getRewards();

  el.innerHTML = `
    <h2>Parent Dashboard</h2>
    <h3>Set Daily Tasks</h3>
    ${["Jay", "Casey", "Milly"].map(kid => `
      <div><strong>${kid}</strong>
        ${weekdays.map(day => `
          <div>${day}: <input type="text" placeholder="Comma-separated" value="${(routines[kid]?.[day] || []).join(", ")}"
            onchange="window.updateTasks('${kid}', '${day}', this.value)">
          </div>`).join("")}
        <button onclick="window.resetStats('${kid}')">Reset Points</button>
      </div>
    `).join("")}
    <h3>Manage Rewards</h3>
    <div id="reward-list">
      ${rewards.map((r, i) => `
        <div>
          <input type="text" value="${r.name}" onchange="window.editReward(${i}, 'name', this.value)">
          <input type="number" value="${r.cost}" onchange="window.editReward(${i}, 'cost', this.value)">
        </div>
      `).join("")}
    </div>
    <button onclick="window.addReward()">Add Reward</button>
    <button onclick="window.saveRewards()">Save Rewards</button>
    <br><br>
    <button onclick="window.loadDashboard()">Back</button>
  `;
};

window.updateTasks = async function(name, day, value) {
  const routines = await getRoutineData();
  if (!routines[name]) routines[name] = {};
  routines[name][day] = value.split(",").map(t => t.trim()).filter(Boolean);
  await saveRoutineData(routines);
};

window.resetStats = async function(name) {
  const stats = await getUserStats();
  stats[name] = { points: 0, streak: 0, lastCompleted: "" };
  await saveUserStats(stats);
  alert(`${name}'s stats have been reset.`);
  window.loadParentDashboard();
};

window.addReward = function () {
  const list = document.getElementById("reward-list");
  const index = list.children.length;
  const div = document.createElement("div");
  div.innerHTML = `
    <input type="text" onchange="window.editReward(${index}, 'name', this.value)">
    <input type="number" onchange="window.editReward(${index}, 'cost', this.value)">
  `;
  list.appendChild(div);
};

window.editReward = function (index, field, value) {
  const rewardsDivs = document.querySelectorAll("#reward-list div");
  const updated = Array.from(rewardsDivs).map(div => {
    const inputs = div.querySelectorAll("input");
    return { name: inputs[0].value, cost: parseInt(inputs[1].value) || 0 };
  });
  window.updatedRewards = updated;
};

window.saveRewards = async function () {
  const rewards = window.updatedRewards || [];
  await saveRewards(rewards);
  alert("Rewards saved!");
};

window.onload = () => window.loadDashboard();

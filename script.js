
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
  return Array.isArray(result) ? result : [];
};

window.toggleTask = async function(name, date, task) {
  const progress = await getProgressData();
  const stats = await getUserStats();
  const key = name + "_" + date;

  if (!progress[key]) progress[key] = [];

  const done = progress[key];
  const isCompleted = done.includes(task);
  const routines = await getRoutineData();
  const dayName = weekdays[new Date(date).getDay()];
  const taskCount = routines[name]?.[dayName]?.length || 0;

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

 {
  const result = await getDocData("shared", "rewards");
  return Array.isArray(result) ? result : [];
};
const saveRewards = (data) => setDocData("shared", "rewards", data);

function renderProfileDashboard(avatars) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Who's checking in?</h2>
    ${kids.map(name => `
      <button onclick="window.loadChildView('${name}')">
        ${avatars[name] || "👤"} ${name}
      </button>
    `).join(" ")}
    <br><br>
    <button onclick="window.loadParentDashboard()">Parent Mode</button>
  `;
}

window.loadDashboard = async function () {
  const avatars = await getAvatars();
  renderProfileDashboard(avatars);
};

window.loadParentDashboard = async function () {
  const app = document.getElementById("app");
  const routines = await getRoutineData();
  const avatars = await getAvatars();
  const rewards = await getRewards();
  const avatarOptions = ["🐶", "🐱", "🦊", "🐸", "🐵", "🦁", "🐯", "🐼", "🐷", "🐨", "🦄"];

  app.innerHTML = `
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
      ${rewards.map((r, i) => `<li>${r.name} - ${r.cost} pts</li>`).join("")}
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


window.loadChildView = async function(name) {
  const app = document.getElementById("app");
  const today = new Date();
  let selectedDate = today.toISOString().split('T')[0];

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
    const isToday = selectedDate === today.toISOString().split('T')[0];
    const allDone = tasks.length > 0 && tasks.every(task => done.includes(task));
    if (isToday && allDone && currentStats.lastCompleted !== selectedDate) {
      currentStats.points += tasks.length;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split("T")[0];
      currentStats.streak = (currentStats.lastCompleted === yesterdayKey) ? currentStats.streak + 1 : 1;
      currentStats.lastCompleted = selectedDate;
      stats[name] = currentStats;
      await saveUserStats(stats);
    }
    const displayDate = new Date(selectedDate).toDateString();
    const streakLine = `<p>⭐ Points: ${currentStats.points} | 🔥 Streak: ${currentStats.streak} days</p>`;
    const rewardList = rewards.map(r => {
      const canRedeem = currentStats.points >= r.cost;
      return `<li>${r.name} - ${r.cost} pts ${canRedeem && isToday ? `<button onclick="window.redeemRewardChild('${name}', '${r.name}', ${r.cost})">Redeem</button>` : ""}</li>`;
    }).join("");

    app.innerHTML = `
      <h2>${name}'s Tasks for ${dayName}</h2>
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
  window.currentDate = newDate.toISOString().split('T')[0];
  window.loadChildView(name);
};

window.toggleTask = async function(name, date, task) {
  const progress = await getProgressData();
  const key = name + "_" + date;
  if (!progress[key]) progress[key] = [];
  if (progress[key].includes(task)) {
    progress[key] = progress[key].filter(t => t !== task);
  } else {
    progress[key].push(task);
  }
  await saveProgressData(progress);
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

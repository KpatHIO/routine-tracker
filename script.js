
const defaultTasks = [
  "Brush Teeth Morning",
  "Brush Your Hair",
  "Make Your Bed",
  "Eat Your Breakfast",
  "Pack Your School Bag",
  "Take Off School Uniform",
  "Unpack Lunch Bag",
  "Do Your Homework",
  "Brush Your Teeth Night"
];

let avatars = {};

function loadAvatars() {
  avatars = JSON.parse(localStorage.getItem("avatars") || "{}");
  if (!avatars.Jay) avatars.Jay = "🐱";
  if (!avatars.Casey) avatars.Casey = "🚀";
  if (!avatars.Milly) avatars.Milly = "🌟";
  localStorage.setItem("avatars", JSON.stringify(avatars));
}

function saveAvatars(data) {
  localStorage.setItem("avatars", JSON.stringify(data));
}

function resetApp() {
  if (confirm("Are you sure you want to clear all saved data?")) {
    localStorage.clear();
    location.reload();
  }
}

function getTodayKey() {
  return new Date().toLocaleDateString('en-AU', { weekday: 'long' });
}

import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

async function getRoutineData() {
  const docRef = doc(window.db, "shared", "routineData");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveRoutineData(data) {
  const docRef = doc(window.db, "shared", "routineData");
  await setDoc(docRef, data);
}

function getRewards() {
  return JSON.parse(localStorage.getItem("rewardData") || "[]");
}

function saveRewards(data) {
  localStorage.setItem("rewardData", JSON.stringify(data));
}

function getUserStats() {
  return JSON.parse(localStorage.getItem("userStats") || "{}");
}

function saveUserStats(stats) {
  localStorage.setItem("userStats", JSON.stringify(stats));
}

function loadChildDashboard(name) {
  const app = document.getElementById('app');
  const today = getTodayKey();
  const routines = getRoutineData();
  const todayTasks = (routines[name] && routines[name][today]) || defaultTasks;
  const dateKey = new Date().toLocaleDateString();
  const taskKey = `${name}_${dateKey}`;
  let savedProgress = JSON.parse(localStorage.getItem(taskKey));
  let tasks = todayTasks.map(task => {
    const existing = savedProgress ? savedProgress.find(t => t.text === task) : null;
    return { text: task, done: existing ? existing.done : false };
  });

  const completed = tasks.filter(t => t.done).length;
  const progress = Math.round((completed / tasks.length) * 100);
  const pointsToday = completed;

  let stats = getUserStats();
  if (!stats[name]) stats[name] = { points: 0, streak: 0, lastCompleted: "" };

  if (completed === tasks.length && stats[name].lastCompleted !== dateKey) {
    stats[name].streak += 1;
    stats[name].points += pointsToday;
    stats[name].lastCompleted = dateKey;
    saveUserStats(stats);
  }

  const taskListHTML = tasks.map((task, index) => `
    <li>
      <label>
        <input type="checkbox" onchange="toggleTask('${name}', ${index})" ${task.done ? 'checked' : ''}>
        ${task.text}
      </label>
    </li>
  `).join("");

  app.innerHTML = `
    <h2>${avatars[name] || "👤"} Hi ${name}!</h2>
    <p>Here's your routine for ${today}:</p>
    <div class="progress-bar">
      <div class="progress" style="width: ${progress}%;">${progress}%</div>
    </div>
    <p>⭐ Points: ${stats[name].points} &nbsp;&nbsp; 🔥 Streak: ${stats[name].streak} day(s)</p>
    <ul class="task-list">${taskListHTML}</ul>
    <button onclick="loadProfileDashboard()">Back to Profiles</button>
  `;

  localStorage.setItem(taskKey, JSON.stringify(tasks));
}

function loadProfileDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2 class="title">Who's checking in?</h2>
    <div class="profile-grid">
      <div class="profile-card" onclick="loadChildDashboard('Jay')">
        <div class="avatar">${avatars['Jay'] || 'J'}</div>
        <p>Jay</p>
      </div>
      <div class="profile-card" onclick="loadChildDashboard('Casey')">
        <div class="avatar">${avatars['Casey'] || 'C'}</div>
        <p>Casey</p>
      </div>
      <div class="profile-card" onclick="loadChildDashboard('Milly')">
        <div class="avatar">${avatars['Milly'] || 'M'}</div>
        <p>Milly</p>
      </div>
    </div>
    <button class="parent-button" onclick="loadParentDashboard()">Parent Mode</button>
  `;
}

function toggleTask(name, index) {
  const today = new Date().toLocaleDateString();
  const key = `${name}_${today}`;
  let tasks = JSON.parse(localStorage.getItem(key));
  tasks[index].done = !tasks[index].done;
  localStorage.setItem(key, JSON.stringify(tasks));
  loadChildDashboard(name);
}

function loadParentDashboard() {
  const app = document.getElementById('app');
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const kids = ["Jay", "Casey", "Milly"];
  const routines = getRoutineData();
  const rewards = getRewards();

  const routineEditor = kids.map(kid => {
    return days.map(day => {
      const currentTasks = (routines[kid] && routines[kid][day]) || [];
      return `
        <div class="routine-block">
          <h4>${kid} - ${day}</h4>
          <textarea id="${kid}_${day}" rows="2" placeholder="Enter tasks separated by commas">${currentTasks.join(", ")}</textarea>
        </div>
      `;
    }).join("");
  }).join("");

  const rewardList = rewards.map((reward, index) => `
    <li>${reward.name} - ${reward.cost} pts <button onclick="redeemReward(${index})">Redeem</button></li>
  `).join("");

  const avatarOptions = ["🐱", "🐶", "🦊", "🐻", "🐼", "🚀", "🦄", "🌟", "🧁"];
  const avatarPicker = kids.map(name => {
    return `
      <div>
        <strong>${name}:</strong>
        ${avatarOptions.map(a => `<button onclick="updateAvatar('${name}', '${a}')">${a}</button>`).join(" ")}
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <h2>Parent Dashboard</h2>
    <h3>Routines</h3>
    ${routineEditor}
    <button onclick="saveParentRoutines()">Save Routines</button>
    <h3>Rewards</h3>
    <div>
      <input id="rewardName" placeholder="Reward Name" />
      <input id="rewardCost" type="number" placeholder="Points Cost" />
      <button onclick="addReward()">Add Reward</button>
    </div>
    <ul>${rewardList}</ul>
    <h3>Choose Avatars</h3>
    ${avatarPicker}
    <button onclick="resetApp()">Reset App</button><br><br>
    <button onclick="loadProfileDashboard()">Back to Profiles</button>
  `;
}

function saveParentRoutines() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const kids = ["Jay", "Casey", "Milly"];
  const data = {};

  kids.forEach(kid => {
    data[kid] = {};
    days.forEach(day => {
      const textarea = document.getElementById(`${kid}_${day}`);
      const tasks = textarea.value.split(',').map(t => t.trim()).filter(Boolean);
      data[kid][day] = tasks;
    });
  });

  saveRoutineData(data);
  alert("Routines saved!");
}

function addReward() {
  const name = document.getElementById("rewardName").value.trim();
  const cost = parseInt(document.getElementById("rewardCost").value.trim(), 10);
  if (!name || isNaN(cost)) return alert("Please enter valid reward details.");
  const rewards = getRewards();
  rewards.push({ name, cost });
  saveRewards(rewards);
  loadParentDashboard();
}

function redeemReward(index) {
  const rewards = getRewards();
  const reward = rewards[index];
  const user = prompt("Enter child name to redeem for (Jay, Casey, Milly):");
  if (!["Jay", "Casey", "Milly"].includes(user)) return alert("Invalid name.");
  const stats = getUserStats();
  if (stats[user].points < reward.cost) return alert("Not enough points.");
  stats[user].points -= reward.cost;
  saveUserStats(stats);
  alert(`${reward.name} redeemed for ${user}!`);
  loadParentDashboard();
}

function updateAvatar(name, emoji) {
  avatars[name] = emoji;
  saveAvatars(avatars);
  loadParentDashboard();
}

// Expose functions globally
window.loadChildDashboard = loadChildDashboard;
window.loadProfileDashboard = loadProfileDashboard;
window.loadParentDashboard = loadParentDashboard;
window.toggleTask = toggleTask;
window.resetApp = resetApp;
window.saveParentRoutines = saveParentRoutines;
window.addReward = addReward;
window.redeemReward = redeemReward;
window.updateAvatar = updateAvatar;

document.addEventListener("DOMContentLoaded", function () {
  try {
    loadAvatars();
    loadProfileDashboard();
  } catch (err) {
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = '<p style="color:red;font-weight:bold;">App error: ' + err.message + '</p>';
    }
    console.error(err);
  }
});

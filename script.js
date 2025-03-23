
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

async function getRoutineData() {
  const docRef = doc(db, "shared", "routineData");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveRoutineData(data) {
  const docRef = doc(db, "shared", "routineData");
  await setDoc(docRef, data);
}

async function getProgressData() {
  const docRef = doc(db, "shared", "progressData");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveProgressData(data) {
  const docRef = doc(db, "shared", "progressData");
  await setDoc(docRef, data);
}

function loadDashboard() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Who's checking in?</h2>
    ${kids.map(name => `
      <button onclick="loadChildView('${name}')">${name}</button>
    `).join(" ")}
    <br><br>
    <button onclick="window.loadParentDashboard()">Parent Mode</button>
  `;
}

window.loadChildView = async function(name) {
  const app = document.getElementById("app");
  const today = new Date();
  let selectedDate = today.toISOString().split('T')[0];

  const render = async () => {
    const routines = await getRoutineData();
    const progress = await getProgressData();
    const dayName = weekdays[new Date(selectedDate).getDay()];
    const tasks = routines[name]?.[dayName] || [];
    const key = name + "_" + selectedDate;
    const done = progress[key] || [];

    app.innerHTML = `
      <h2>${name}'s Tasks for ${dayName}</h2>
      <input type="date" id="dayPicker" value="${selectedDate}" />
      <ul class="task-list">
        ${tasks.map((task, i) => `
          <li>
            <input type="checkbox" id="task_${i}" ${done.includes(task) ? "checked" : ""} ${selectedDate !== today.toISOString().split('T')[0] ? "disabled" : ""} onchange="toggleTask('${name}', '${selectedDate}', '${task}')">
            ${task}
          </li>
        `).join("")}
      </ul>
      <button onclick="window.loadDashboard()">Back</button>
    `;

    document.getElementById("dayPicker").addEventListener("change", async (e) => {
      selectedDate = e.target.value;
      render();
    });
  };

  render();
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
  setTimeout(() => window.loadChildView(name), 100);
};

window.loadParentDashboard = async function() {
  const app = document.getElementById("app");
  const routines = await getRoutineData();

  app.innerHTML = `
    <h2>Parent Dashboard</h2>
    ${kids.map(kid => `
      <h3>${kid}</h3>
      ${weekdays.map(day => `
        <div>
          <strong>${day}:</strong><br>
          <input type="text" id="${kid}_${day}" value="${(routines[kid]?.[day] || []).join(', ')}" style="width:100%;" />
        </div>
      `).join("")}
    `).join("")}
    <br><button onclick="saveParentRoutines()">Save Routines</button>
    <button onclick="window.loadDashboard()">Back</button>
  `;
};

window.saveParentRoutines = async function() {
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

document.addEventListener("DOMContentLoaded", loadDashboard);


window.loadDashboard = loadDashboard;

async function getUserStats() {
  const docRef = doc(db, "shared", "userStats");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveUserStats(stats) {
  const docRef = doc(db, "shared", "userStats");
  await setDoc(docRef, stats);
}

// Modify loadChildView to include streak/points logic
window.loadChildView = async function(name) {
  const app = document.getElementById("app");
  const today = new Date();
  let selectedDate = today.toISOString().split('T')[0];

  const render = async () => {
    const routines = await getRoutineData();
    const progress = await getProgressData();
    const stats = await getUserStats();

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

    const streakLine = `<p>⭐ Points: ${currentStats.points} | 🔥 Streak: ${currentStats.streak} days</p>`;

    app.innerHTML = `
      <h2>${name}'s Tasks for ${dayName}</h2>
      <input type="date" id="dayPicker" value="${selectedDate}" />
      ${isToday ? streakLine : ""}
      <ul class="task-list">
        ${tasks.map((task, i) => `
          <li>
            <input type="checkbox" id="task_${i}" ${done.includes(task) ? "checked" : ""} ${!isToday ? "disabled" : ""} onchange="toggleTask('${name}', '${selectedDate}', '${task}')">
            ${task}
          </li>
        `).join("")}
      </ul>
      <button onclick="window.loadDashboard()">Back</button>
    `;

    document.getElementById("dayPicker").addEventListener("change", async (e) => {
      selectedDate = e.target.value;
      render();
    });
  };

  render();
};


async function getAvatars() {
  const docRef = doc(db, "shared", "avatars");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : {};
}

async function saveAvatars(data) {
  const docRef = doc(db, "shared", "avatars");
  await setDoc(docRef, data);
}

async function getRewards() {
  const docRef = doc(db, "shared", "rewards");
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : [];
}

async function saveRewards(data) {
  const docRef = doc(db, "shared", "rewards");
  await setDoc(docRef, data);
}

// Modify dashboard to include avatars
function renderProfileDashboard(avatars) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Who's checking in?</h2>
    ${kids.map(name => `
      <button onclick="loadChildView('${name}')">
        ${avatars[name] || "👤"} ${name}
      </button>
    `).join(" ")}
    <br><br>
    <button onclick="loadParentDashboard()">Parent Mode</button>
  `;
}

window.loadDashboard = async function() {
  const avatars = await getAvatars();
  renderProfileDashboard(avatars);
};

// Extend parent dashboard to include avatars and rewards
window.loadParentDashboard = async function() {
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
          <button onclick="updateAvatar('${kid}', '${a}')">${a}</button>
        `).join(" ")}
      </div>
    `).join("")}

    <hr><h3>Rewards</h3>
    <ul id="rewardList">
      ${rewards.map((r, i) => `<li>${r.name} - ${r.cost} pts <button onclick="redeemReward(${i})">Redeem</button></li>`).join("")}
    </ul>
    <input type="text" id="rewardName" placeholder="Reward Name" />
    <input type="number" id="rewardCost" placeholder="Points Cost" />
    <button onclick="addReward()">Add Reward</button>
    <br><br>
    <button onclick="saveParentRoutines()">Save Routines</button>
    <button onclick="window.loadDashboard()">Back</button>
  `;
};

window.updateAvatar = async function(name, emoji) {
  const avatars = await getAvatars();
  avatars[name] = emoji;
  await saveAvatars(avatars);
  loadParentDashboard();
};

window.addReward = async function() {
  const name = document.getElementById("rewardName").value.trim();
  const cost = parseInt(document.getElementById("rewardCost").value.trim(), 10);
  if (!name || isNaN(cost)) {
    alert("Please enter valid reward details.");
    return;
  }
  const rewards = await getRewards();
  rewards.push({ name, cost });
  await saveRewards(rewards);
  loadParentDashboard();
};

window.redeemReward = async function(index) {
  const rewards = await getRewards();
  const reward = rewards[index];
  const child = prompt("Enter child name to redeem for (Jay, Casey, Milly):");
  if (!kids.includes(child)) return alert("Invalid name.");
  const stats = await getUserStats();

  if ((stats[child]?.points || 0) < reward.cost) {
    return alert(`${child} doesn't have enough points.`);
  }

  stats[child].points -= reward.cost;
  await saveUserStats(stats);
  alert(`${child} redeemed "${reward.name}"!`);
  loadParentDashboard();
};

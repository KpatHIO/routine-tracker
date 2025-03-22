
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

function getTodayKey() {
  return new Date().toLocaleDateString('en-AU', { weekday: 'long' });
}

function getRoutineData() {
  return JSON.parse(localStorage.getItem("routineData") || "{}");
}

function saveRoutineData(data) {
  localStorage.setItem("routineData", JSON.stringify(data));
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

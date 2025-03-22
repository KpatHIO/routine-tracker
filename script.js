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

// Load dashboard on startup
document.addEventListener('DOMContentLoaded', () => {
  loadProfileDashboard();
});

function loadProfileDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2 class="title">Who's checking in?</h2>
    <div class="profile-grid">
      <div class="profile-card" onclick="loadChildDashboard('Jay')">
        <div class="avatar">J</div>
        <p>Jay</p>
      </div>
      <div class="profile-card" onclick="loadChildDashboard('Casey')">
        <div class="avatar">C</div>
        <p>Casey</p>
      </div>
      <div class="profile-card" onclick="loadChildDashboard('Milly')">
        <div class="avatar">M</div>
        <p>Milly</p>
      </div>
    </div>
    <button class="parent-button" onclick="loadParentDashboard()">Parent Mode</button>
  `;
}

function loadChildDashboard(name) {
  const app = document.getElementById('app');

  const today = new Date().toLocaleDateString();
  const key = `${name}_${today}`;
  let tasks = JSON.parse(localStorage.getItem(key)) || defaultTasks.map(task => ({ text: task, done: false }));

  const taskListHTML = tasks.map((task, index) => `
    <li>
      <label>
        <input type="checkbox" onchange="toggleTask('${name}', ${index})" ${task.done ? 'checked' : ''}>
        ${task.text}
      </label>
    </li>
  `).join("");

  const progress = Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

  app.innerHTML = `
    <h2>Hi ${name}!</h2>
    <p>Here's your routine for today:</p>
    <div class="progress-bar">
      <div class="progress" style="width: ${progress}%;">${progress}%</div>
    </div>
    <ul class="task-list">
      ${taskListHTML}
    </ul>
    <button onclick="loadProfileDashboard()">⬅️ Back to Profiles</button>
  `;

  localStorage.setItem(key, JSON.stringify(tasks));
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
  app.innerHTML = `
    <h2>Parent Dashboard</h2>
    <p>Coming soon: Manage routines, tasks, and rewards.</p>
    <button onclick="loadProfileDashboard()">⬅️ Back to Profiles</button>
  `;
}


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
  `;
};

const STORAGE_KEY = "qto-portal-data-v1";
const SESSION_KEY = "qto-portal-session-v1";

const DEFAULT_DATA = {
  users: [
    {
      id: "admin-1",
      name: "Administrator",
      email: "admin@qto.local",
      password: "Admin123!",
      role: "admin",
      active: true
    }
  ],
  projects: [
    {
      id: "project-1",
      name: "North Tower",
      code: "NTR-01",
      elevations: ["Elevation A", "Elevation B", "Elevation C"],
      stages: ["Schematic Design", "Working Drawing", "Construction Documentation"]
    },
    {
      id: "project-2",
      name: "Harbor Residences",
      code: "HR-22",
      elevations: ["Elevation A", "Elevation B"],
      stages: ["Schematic Design", "Working Drawing"]
    }
  ],
  requests: [
    {
      id: "req-001",
      requestNo: "QTO-20261013-100",
      projectId: "project-1",
      projectName: "North Tower",
      elevation: "Elevation A",
      stage: "Schematic Design",
      requestedBy: "Administrator",
      status: "submitted",
      notes: "Initial review for concept package.",
      createdAt: "2026-10-13T10:00:00.000Z",
      downloadUrl: ""
    }
  ]
};

const state = {
  data: null,
  user: null
};

const authScreen = document.getElementById("auth-screen");
const appShell = document.getElementById("app-shell");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const requestForm = document.getElementById("request-form");
const requestMessage = document.getElementById("request-message");
const projectSelect = document.getElementById("project-select");
const elevationSelect = document.getElementById("elevation-select");
const stageSelect = document.getElementById("stage-select");
const historyTableBody = document.getElementById("history-table-body");
const projectList = document.getElementById("project-list");
const userList = document.getElementById("user-list");
const adminRequestList = document.getElementById("admin-request-list");
const projectForm = document.getElementById("project-form");
const userForm = document.getElementById("user-form");
const welcomeName = document.getElementById("welcome-name");
const userRole = document.getElementById("user-role");
const openCount = document.getElementById("open-count");
const completedCount = document.getElementById("completed-count");

function generateRequestNo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(100 + Math.random() * 900);
  return `QTO-${year}${month}${day}-${random}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    state.data = JSON.parse(saved);
    return;
  }
  state.data = DEFAULT_DATA;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function getCurrentSession() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

function setSession(user) {
  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    state.user = null;
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  state.user = user;
}

function showMessage(element, text, type = "success") {
  element.textContent = text;
  element.className = `message ${type}`;
  element.classList.remove("hidden");
}

function hideMessage(element) {
  element.classList.add("hidden");
}

function setView(viewName) {
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("hidden", view.id !== `${viewName}-view`);
  });
}

function renderAuthState() {
  if (!state.user) {
    authScreen.classList.remove("hidden");
    appShell.classList.add("hidden");
    return;
  }

  authScreen.classList.add("hidden");
  appShell.classList.remove("hidden");

  welcomeName.textContent = state.user.name;
  userRole.textContent = state.user.role === "admin" ? "Admin" : "User";
}

function updateDashboardSummary() {
  const open = state.data.requests.filter((request) => request.status !== "completed").length;
  const completed = state.data.requests.filter((request) => request.status === "completed").length;
  openCount.textContent = open;
  completedCount.textContent = completed;
}

function renderProjectSelect() {
  projectSelect.innerHTML = "<option value=''>Select project</option>";

  state.data.projects
    .filter((project) => project.active !== false)
    .forEach((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = `${project.name} (${project.code || "No code"})`;
      projectSelect.appendChild(option);
    });

  updateProjectDetails();
}

function updateProjectDetails() {
  const selectedId = projectSelect.value;
  const project = state.data.projects.find((item) => item.id === selectedId);

  elevationSelect.innerHTML = "";
  stageSelect.innerHTML = "";

  if (!project) {
    elevationSelect.innerHTML = '<option value="">Select project first</option>';
    stageSelect.innerHTML = '<option value="">Select project first</option>';
    return;
  }

  project.elevations.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    elevationSelect.appendChild(option);
  });

  project.stages.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    stageSelect.appendChild(option);
  });
}

function renderHistoryTable() {
  historyTableBody.innerHTML = "";

  if (!state.data.requests.length) {
    historyTableBody.innerHTML = '<tr><td colspan="7">No requests yet.</td></tr>';
    return;
  }

  state.data.requests
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((request) => {
      const row = document.createElement("tr");

      const statusClass = request.status === "completed"
        ? "green"
        : request.status === "in_progress"
          ? "blue"
          : request.status === "rejected"
            ? "orange"
            : "blue";

      row.innerHTML = `
        <td>${request.requestNo}</td>
        <td>${request.projectName}</td>
        <td>${request.elevation}</td>
        <td>${request.stage}</td>
        <td><span class="status-badge ${statusClass}">${request.status}</span></td>
        <td>${new Date(request.createdAt).toLocaleDateString()}</td>
        <td>
          ${request.status === "completed" && request.downloadUrl
            ? `<button class="download-btn" data-download="${request.downloadUrl}">Download</button>`
            : "-"}
        </td>
      `;

      historyTableBody.appendChild(row);
    });

  document.querySelectorAll("[data-download]").forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.getAttribute("data-download");
      if (!url) return;
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    });
  });
}

function renderProjectList() {
  projectList.innerHTML = "";

  state.data.projects.forEach((project) => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <div class="project-card-header">
        <h5>${project.name}</h5>
        <button class="small-action" data-project-edit="${project.id}">Edit</button>
      </div>
      <div class="meta">${project.code || "No code"}</div>
      <div class="chip-list">
        ${project.elevations.map((item) => `<span class="chip">${item}</span>`).join("")}
      </div>
      <div class="chip-list">
        ${project.stages.map((item) => `<span class="chip">${item}</span>`).join("")}
      </div>
      <form class="inline-form" data-project-add-elevation="${project.id}">
        <input type="text" name="elevation" placeholder="Add elevation" />
        <button class="small-action" type="submit">Add</button>
      </form>
      <form class="inline-form" data-project-add-stage="${project.id}">
        <input type="text" name="stage" placeholder="Add stage" />
        <button class="small-action" type="submit">Add</button>
      </form>
    `;

    projectList.appendChild(card);
  });

  document.querySelectorAll("[data-project-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-project-edit");
      const project = state.data.projects.find((item) => item.id === id);
      if (!project) return;

      document.getElementById("project-id").value = project.id;
      document.getElementById("project-name").value = project.name;
      document.getElementById("project-code").value = project.code || "";
      document.getElementById("project-active").checked = project.active !== false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-project-add-elevation]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const projectId = form.getAttribute("data-project-add-elevation");
      const project = state.data.projects.find((item) => item.id === projectId);
      const input = form.querySelector('input[name="elevation"]');
      if (!project || !input.value.trim()) return;

      project.elevations.push(input.value.trim());
      input.value = "";
      persistState();
      renderProjectList();
      renderProjectSelect();
    });
  });

  document.querySelectorAll("[data-project-add-stage]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const projectId = form.getAttribute("data-project-add-stage");
      const project = state.data.projects.find((item) => item.id === projectId);
      const input = form.querySelector('input[name="stage"]');
      if (!project || !input.value.trim()) return;

      project.stages.push(input.value.trim());
      input.value = "";
      persistState();
      renderProjectList();
      renderProjectSelect();
    });
  });
}

function renderUsers() {
  userList.innerHTML = "";

  state.data.users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
      <div class="user-card-header">
        <h5>${user.name}</h5>
        <span class="status-badge ${user.role === "admin" ? "purple" : "blue"}">${user.role}</span>
      </div>
      <div>${user.email}</div>
      <div class="meta">
        <span>${user.active ? "Active" : "Inactive"}</span>
      </div>
    `;
    userList.appendChild(card);
  });
}

function renderAdminQueue() {
  adminRequestList.innerHTML = "";

  state.data.requests.forEach((request) => {
    const card = document.createElement("div");
    card.className = "request-card";
    card.innerHTML = `
      <div class="request-card-header">
        <h5>${request.requestNo}</h5>
        <span class="status-badge ${request.status === "completed" ? "green" : request.status === "rejected" ? "orange" : "blue"}">${request.status}</span>
      </div>
      <div>${request.projectName} / ${request.elevation} / ${request.stage}</div>
      <div class="meta">
        <span>Requested by: ${request.requestedBy}</span>
      </div>
      <div class="meta">
        <select class="select-status" data-status-id="${request.id}">
          <option value="submitted" ${request.status === "submitted" ? "selected" : ""}>Submitted</option>
          <option value="in_progress" ${request.status === "in_progress" ? "selected" : ""}>In Progress</option>
          <option value="completed" ${request.status === "completed" ? "selected" : ""}>Completed</option>
          <option value="rejected" ${request.status === "rejected" ? "selected" : ""}>Rejected</option>
        </select>
        <button class="small-action" data-status-update="${request.id}">Update</button>
      </div>
      <div class="meta">
        <input type="text" data-download-url="${request.id}" value="${request.downloadUrl || ""}" placeholder="Download URL" />
      </div>
    `;
    adminRequestList.appendChild(card);
  });

  document.querySelectorAll("[data-status-update]").forEach((button) => {
    button.addEventListener("click", () => {
      const requestId = button.getAttribute("data-status-update");
      const request = state.data.requests.find((item) => item.id === requestId);
      const statusSelect = document.querySelector(`[data-status-id="${requestId}"]`);
      const downloadInput = document.querySelector(`[data-download-url="${requestId}"]`);

      if (!request || !statusSelect) return;

      request.status = statusSelect.value;
      request.downloadUrl = downloadInput ? downloadInput.value.trim() : "";
      persistState();
      renderHistoryTable();
      renderAdminQueue();
      updateDashboardSummary();
    });
  });
}

function renderAll() {
  updateDashboardSummary();
  renderProjectSelect();
  renderHistoryTable();
  renderProjectList();
  renderUsers();
  renderAdminQueue();
}

function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const foundUser = state.data.users.find(
    (user) => user.email.toLowerCase() === email && user.password === password && user.active !== false
  );

  if (!foundUser) {
    showMessage(loginMessage, "Invalid username or password.", "error");
    return;
  }

  setSession(foundUser);
  renderAuthState();
  setView("dashboard");
  hideMessage(loginMessage);
}

function handleLogout() {
  setSession(null);
  renderAuthState();
  loginForm.reset();
}

function handleRequestSubmit(event) {
  event.preventDefault();

  const projectId = projectSelect.value;
  const project = state.data.projects.find((item) => item.id === projectId);
  const elevation = elevationSelect.value;
  const stage = stageSelect.value;

  if (!project || !elevation || !stage) {
    showMessage(requestMessage, "Please select a valid project, elevation, and project stage.", "error");
    return;
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    requestNo: generateRequestNo(),
    projectId: project.id,
    projectName: project.name,
    elevation,
    stage,
    requestedBy: state.user.name,
    status: "submitted",
    notes: document.getElementById("request-notes").value.trim(),
    createdAt: new Date().toISOString(),
    downloadUrl: ""
  };

  state.data.requests.push(newRequest);
  persistState();
  renderAll();
  requestForm.reset();
  updateProjectDetails();
  showMessage(requestMessage, "Request submitted successfully.", "success");
}

function handleProjectSubmit(event) {
  event.preventDefault();

  const projectId = document.getElementById("project-id").value;
  const name = document.getElementById("project-name").value.trim();
  const code = document.getElementById("project-code").value.trim();
  const active = document.getElementById("project-active").checked;

  if (!name) return;

  if (projectId) {
    const project = state.data.projects.find((item) => item.id === projectId);
    if (project) {
      project.name = name;
      project.code = code;
      project.active = active;
    }
  } else {
    state.data.projects.push({
      id: `project-${Date.now()}`,
      name,
      code,
      active,
      elevations: ["Elevation A"],
      stages: ["Schematic Design"]
    });
  }

  persistState();
  renderAll();
  projectForm.reset();
  document.getElementById("project-id").value = "";
  document.getElementById("project-active").checked = true;
}

function handleUserSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("user-name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const password = document.getElementById("user-password").value;
  const role = document.getElementById("user-role-select").value;
  const active = document.getElementById("user-active").checked;

  if (!name || !email) return;

  const existing = state.data.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.active = active;
    if (password) existing.password = password;
  } else {
    state.data.users.push({
      id: `user-${Date.now()}`,
      name,
      email,
      password: password || "Welcome123!",
      role,
      active
    });
  }

  persistState();
  renderUsers();
  userForm.reset();
  document.getElementById("user-active").checked = true;
}

function bindEvents() {
  loginForm.addEventListener("submit", handleLogin);
  document.getElementById("logout-btn").addEventListener("click", handleLogout);
  requestForm.addEventListener("submit", handleRequestSubmit);
  projectForm.addEventListener("submit", handleProjectSubmit);
  userForm.addEventListener("submit", handleUserSubmit);
  projectSelect.addEventListener("change", updateProjectDetails);

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
    });
  });
}

function init() {
  loadState();
  bindEvents();
  const session = getCurrentSession();

  if (session) {
    const userExists = state.data.users.find((user) => user.email === session.email && user.active !== false);
    if (userExists) {
      state.user = userExists;
      renderAuthState();
      setView("dashboard");
    }
  }

  if (!state.user) {
    renderAuthState();
  }

  renderAll();
}

init();

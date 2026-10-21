import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  serverTimestamp,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import {doc,getDoc,getFirestore,collection,getDocs,addDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

import {
  updateDoc,
  arrayUnion,
  arrayRemove
} from
"https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

/*
 * ============================================================
 * Firebase initialization
 * ============================================================
 */

const firebaseConfig = window.firebaseConfig || {};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY"
);

if (!isFirebaseConfigured) {
  console.error(
    "Firebase configuration is missing. Check firebase-config.js."
  );
}

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getFirestore(firebaseApp);

console.log("admin.js loaded successfully");

/*
 * ============================================================
 * DOM elements
 * ============================================================
 */

// Main navigation
const navigationButtons = Array.from(
  document.querySelectorAll("[data-admin-page]")
);

const administrationPages = Array.from(
  document.querySelectorAll("[data-admin-panel]")
);

const pageTitle =
  document.getElementById("admin-page-title");

const primaryActionButton =
  document.getElementById("admin-primary-action");

const navigationLinks = Array.from(
  document.querySelectorAll("[data-navigate-to]")
);

const actionButtons = Array.from(
  document.querySelectorAll("[data-action]")
);

// Administrator account
const adminAccountName =
  document.getElementById("admin-account-name");

const adminAccountEmail =
  document.getElementById("admin-account-email");

const adminAvatar =
  document.getElementById("admin-avatar");

const adminLogoutButton =
  document.getElementById("admin-logout-button");

// Modal
const modalOverlay =
  document.getElementById("admin-modal-overlay");

const modalTitle =
  document.getElementById("admin-modal-title");

const modalEyebrow =
  document.getElementById("admin-modal-eyebrow");

const modalContent =
  document.getElementById("admin-modal-content");

const closeModalButton =
  document.getElementById("close-admin-modal");

// Detail drawer
const drawer =
  document.getElementById("admin-detail-drawer");

const drawerOverlay =
  document.getElementById("admin-drawer-overlay");

const closeDrawerButton =
  document.getElementById("close-admin-drawer");

const drawerEyebrow =
  document.getElementById("drawer-eyebrow");

const drawerTitle =
  document.getElementById("drawer-title");

const drawerContent =
  document.getElementById("admin-drawer-content");

// Delete confirmation dialog
const deleteModalOverlay =
  document.getElementById("delete-modal-overlay");

const deleteModalMessage =
  document.getElementById("delete-modal-message");

const cancelDeleteButton =
  document.getElementById("cancel-delete-button");

const confirmDeleteButton =
  document.getElementById("confirm-delete-button");

// Dashboard counts
const dashboardUsersCount =
  document.getElementById("dashboard-users-count");

const dashboardProjectsCount =
  document.getElementById("dashboard-projects-count");

const dashboardRequestsCount =
  document.getElementById("dashboard-requests-count");

const dashboardPendingCount =
  document.getElementById("dashboard-pending-count");

const sidebarUsersCount =
  document.getElementById("sidebar-users-count");

const sidebarProjectsCount =
  document.getElementById("sidebar-projects-count");

const sidebarRequestsCount =
  document.getElementById("sidebar-requests-count");

// Tables
const usersTableBody =
  document.getElementById("admin-users-table-body");

const projectsTableBody =
  document.getElementById("admin-projects-table-body");

const requestsTableBody =
  document.getElementById("admin-requests-table-body");

// Search and filters
const globalSearchInput =
  document.getElementById("admin-global-search-input");

const usersSearchInput =
  document.getElementById("users-search-input");

const usersRoleFilter =
  document.getElementById("users-role-filter");

const usersStatusFilter =
  document.getElementById("users-status-filter");

const projectsSearchInput =
  document.getElementById("projects-search-input");

const projectsStatusFilter =
  document.getElementById("projects-status-filter");

const requestsSearchInput =
  document.getElementById("requests-search-input");

const requestsStatusFilter =
  document.getElementById("requests-status-filter");

const requestsProjectFilter =
  document.getElementById("requests-project-filter");

/*
 * ============================================================
 * Application state
 * ============================================================
 */

let currentAdministrator = null;
let pendingDeleteHandler = null;

const pageConfiguration = {
  dashboard: {
    title: "Dashboard",
    primaryAction: "Create project",
    action: "create-project"
  },

  users: {
    title: "Users",
    primaryAction: "Create user",
    action: "create-user"
  },

  projects: {
    title: "Projects",
    primaryAction: "Create project",
    action: "create-project"
  },

  requests: {
    title: "Submitted requests",
    primaryAction: "",
    action: ""
  }
};

/*
 * ============================================================
 * Utility functions
 * ============================================================
 */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setAdminInterfaceEnabled(isEnabled) {
  navigationButtons.forEach((button) => {
    button.disabled = !isEnabled;
  });

  actionButtons.forEach((button) => {
    button.disabled = !isEnabled;
  });

  if (primaryActionButton) {
    primaryActionButton.disabled = !isEnabled;
  }
}

/*
 * ============================================================
 * Page navigation
 * ============================================================
 */

function navigateToPage(pageName) {
  const configuration =
    pageConfiguration[pageName];

  if (!configuration) {
    console.warn(
      `Unknown administration page: ${pageName}`
    );

    return;
  }

  navigationButtons.forEach((button) => {
    const isActive =
      button.dataset.adminPage === pageName;

    button.classList.toggle(
      "is-active",
      isActive
    );

    button.setAttribute(
      "aria-selected",
      String(isActive)
    );
  });

  administrationPages.forEach((page) => {
    const isActive =
      page.dataset.adminPanel === pageName;

    page.classList.toggle(
      "is-active",
      isActive
    );
  });

  if (pageTitle) {
    pageTitle.textContent =
      configuration.title;
  }

  if (!primaryActionButton) {
    return;
  }

  if (configuration.action) {
    primaryActionButton.classList.remove(
      "hidden"
    );

    primaryActionButton.dataset.action =
      configuration.action;

    primaryActionButton.innerHTML =
      configuration.primaryAction === "Create user"
        ? "<span>＋</span> Create user"
        : "<span>＋</span> Create project";
  } else {
    primaryActionButton.classList.add(
      "hidden"
    );

    primaryActionButton.dataset.action = "";
  }
}

/*
 * ============================================================
 * Create user form
 * ============================================================
 */

function getCreateUserForm() {
  return `
    <form
      id="admin-create-user-form"
      class="admin-form"
    >
      <div class="form-grid">
        <label>
          Full name

          <input
            id="create-user-name"
            type="text"
            placeholder="Enter the user's name"
            autocomplete="name"
            required
          />
        </label>

        <label>
          Email

          <input
            id="create-user-email"
            type="email"
            placeholder="user@example.com"
            autocomplete="email"
            required
          />
        </label>
      </div>

      <div class="form-grid">
        <label>
          Role

          <select id="create-user-role">
            <option value="user">
              User
            </option>

            <option value="admin">
              Administrator
            </option>
          </select>
        </label>

        <label>
          Account status

          <select id="create-user-status">
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </label>
      </div>

      <label>
        Temporary password

        <input
          id="create-user-password"
          type="password"
          minlength="6"
          placeholder="Minimum 6 characters"
          autocomplete="new-password"
          required
        />
      </label>

      <p class="form-help">
        The Create User interface is ready. Secure account
        creation will be connected to a backend service later.
      </p>

      <div
        id="create-user-message"
        class="message hidden"
        aria-live="polite"
      ></div>

      <div class="form-actions">
        <button
          type="button"
          class="secondary-button"
          data-close-modal
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary-button"
        >
          Create user
        </button>
      </div>
    </form>
  `;
}

/*
 * ============================================================
 * Create project form
 * ============================================================
 */

function getCreateProjectForm() {
  return `
    <form
      id="admin-create-project-form"
      class="admin-form"
    >
      <label>
        Project name

        <input
          id="create-project-name"
          type="text"
          placeholder="Enter a project name"
          required
        />
      </label>

      <div class="form-grid">
        <label>
          Project status

          <select id="create-project-status">
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </label>

        <label>
          Project code

          <input
            id="create-project-code"
            type="text"
            placeholder="Example: NT-001"
          />
        </label>
      </div>

      <label>
        Elevations

        <textarea
          id="create-project-elevations"
          rows="5"
          placeholder="Enter one elevation per line"
          required
        ></textarea>
      </label>

      <fieldset>
        <legend>Assign users</legend>

        <div
          id="create-project-user-options"
          class="selection-list"
        >
          <p class="form-help">
            Registered users will appear here after the users
            collection is connected to this page.
          </p>
        </div>
      </fieldset>

      <div
        id="create-project-message"
        class="message hidden"
        aria-live="polite"
      ></div>

      <div class="form-actions">
        <button
          type="button"
          class="secondary-button"
          data-close-modal
        >
          Cancel
        </button>

        <button
          type="submit"
          class="primary-button"
        >
          Create project
        </button>
      </div>
    </form>
  `;
}

/*
 * ============================================================
 * Modal functions
 * ============================================================
 */
async function loadUsers() {

  if (!usersTableBody) return;

  usersTableBody.innerHTML = "";

  const snapshot = await getDocs(
    collection(firebaseDb, "users")
  );

  console.log(
    "Users found:",
    snapshot.size
  );

  snapshot.forEach((userDoc) => {

    const user = userDoc.data();

    usersTableBody.innerHTML += `
      
	  <tr>
        <td>${user.displayName || "-"}</td>
		        <td>${user.email || "-"}</td>
		        <td>${user.role || "user"}</td>
				<td>${user.active ? "Active" : "Inactive"}</td>
				<td>${user.projects || "-"}</td>
                <td>${user.requests || "-"}</td>
				<td>${user.createdAt || "-"}</td>
									<td>
					  <button
						class="secondary-button"
						onclick="editUser('${userDoc.id}')">
						Edit
					  </button>
					</td>


      </tr>
    `;
  });

  dashboardUsersCount.textContent =
    snapshot.size;

  sidebarUsersCount.textContent =
    snapshot.size;
}

async function editUser(userId) {

  const userDoc = await getDoc(
    doc(firebaseDb, "users", userId)
  );

  const user = userDoc.data();

  const projectsSnapshot = await getDocs(
    collection(firebaseDb, "projects")
  );

  let availableProjectsHtml = "";
  let assignedProjectsHtml = "";

  projectsSnapshot.forEach((projectDoc) => {

    const project = projectDoc.data();

    const isAssigned =
      project.assignedUserIds?.includes(userId);

    const item = `
      <option value="${projectDoc.id}">
        ${project.name}
      </option>
    `;

    if (isAssigned) {
      assignedProjectsHtml += item;
    } else {
      availableProjectsHtml += item;
    }
  });

  openDetailDrawer({
    eyebrow: "User Management",
    title: `Edit ${user.displayName || user.email}`,
    content: `
      <div class="assignment-layout">

        <div class="assignment-column">
          <h4>Available Projects</h4>
          <select
            id="available-projects"
            multiple
            size="10">
            ${availableProjectsHtml}
          </select>
        </div>

        <div class="assignment-buttons">
          <button id="assign-projects">
            →
          </button>

          <button id="remove-projects">
            ←
          </button>
        </div>

        <div>
          <h4>Assigned Projects</h4>
          <select
            id="assigned-projects"
            multiple
            size="10">
            ${assignedProjectsHtml}
          </select>
        </div>

      </div>

      <div class="form-actions">
        <button
          id="save-user-projects"
          class="primary-button">
          Save Changes
        </button>
      </div>
    `
  });
  attachProjectAssignmentEvents(userId);
}

window.editUser = editUser;
function moveSelected(
  sourceId,
  targetId
) {

  const source =
    document.getElementById(sourceId);

  const target =
    document.getElementById(targetId);

  Array.from(source.selectedOptions)
    .forEach(option => {
      target.appendChild(option);
    });
}

async function saveUserProjects(userId) {
  const saveButton =
    document.getElementById("save-user-projects");

  const assignedList =
    document.getElementById("assigned-projects");

  if (!userId) {
    console.error("Cannot save assignments: userId is missing.");
    alert("The user ID is missing.");

    return;
  }

  if (!assignedList) {
    console.error(
      "Cannot save assignments: #assigned-projects was not found."
    );

    alert("The assigned-projects list was not found.");

    return;
  }

  const assignedProjectIds = Array.from(
    assignedList.options
  ).map((option) => option.value);

  console.log("Saving project assignments:", {
    userId,
    assignedProjectIds
  });

  try {
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Saving...";
    }

    const projectsSnapshot = await getDocs(
      collection(firebaseDb, "projects")
    );

    console.log(
      "Projects checked:",
      projectsSnapshot.size
    );

    const updates = [];

    projectsSnapshot.forEach((projectSnapshot) => {
      const projectId = projectSnapshot.id;
      const project = projectSnapshot.data();

      const currentAssignedUserIds =
        Array.isArray(project.assignedUserIds)
          ? project.assignedUserIds
          : [];

      const isCurrentlyAssigned =
        currentAssignedUserIds.includes(userId);

      const shouldBeAssigned =
        assignedProjectIds.includes(projectId);

      const projectReference = doc(
        firebaseDb,
        "projects",
        projectId
      );

      if (shouldBeAssigned && !isCurrentlyAssigned) {
        console.log(
          `Assigning user ${userId} to project ${projectId}`
        );

        updates.push(
          updateDoc(projectReference, {
            assignedUserIds: arrayUnion(userId)
          })
        );
      }

      if (!shouldBeAssigned && isCurrentlyAssigned) {
        console.log(
          `Removing user ${userId} from project ${projectId}`
        );

        updates.push(
          updateDoc(projectReference, {
            assignedUserIds: arrayRemove(userId)
          })
        );
      }
    });

    console.log(
      "Number of project updates:",
      updates.length
    );

    await Promise.all(updates);

    console.log(
      "Project assignments successfully saved."
    );

    await Promise.all([
      loadUsers(),
      loadProjects()
    ]);

    closeDetailDrawer();

    alert("Project assignments updated successfully.");
  } catch (error) {
    console.error(
      "Saving project assignments failed:",
      error
    );

    alert(
      error?.message ||
      "Project assignments could not be saved."
    );
  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Save Changes";
    }
  }
}

function attachProjectAssignmentEvents(userId) {
  const assignButton =
    document.getElementById("assign-projects");

  const removeButton =
    document.getElementById("remove-projects");

  const saveButton =
    document.getElementById("save-user-projects");

  console.log("Attaching project assignment events:", {
    userId,
    assignButtonFound: Boolean(assignButton),
    removeButtonFound: Boolean(removeButton),
    saveButtonFound: Boolean(saveButton)
  });

  assignButton?.addEventListener(
    "click",
    () => {
      moveSelected(
        "available-projects",
        "assigned-projects"
      );
    }
  );

  removeButton?.addEventListener(
    "click",
    () => {
      moveSelected(
        "assigned-projects",
        "available-projects"
      );
    }
  );

  saveButton?.addEventListener(
    "click",
    async () => {
      console.log(
        "Save Changes clicked for user:",
        userId
      );

      await saveUserProjects(userId);
    }
  );
}

async function loadProjects() {

  if (!projectsTableBody) return;

  projectsTableBody.innerHTML = "";

  // Load all users first
  const usersSnapshot = await getDocs(
    collection(firebaseDb, "users")
  );

  const usersMap = {};

  usersSnapshot.forEach((userDoc) => {
    const user = userDoc.data();

    usersMap[userDoc.id] =
      user.displayName ||
      user.email ||
      userDoc.id;
  });

  // Load projects
  const projectsSnapshot = await getDocs(
    collection(firebaseDb, "projects")
  );

  console.log(
    "Projects found:",
    projectsSnapshot.size
  );

  projectsSnapshot.forEach((projectDoc) => {

    const project = projectDoc.data();

    const assignedUsers =
      (project.assignedUserIds || [])
        .map(uid => usersMap[uid] || uid)
        .join(", ");

    const elevations =
      (project.elevationStyles || [])
        .join(", ");

    const createdDate =
      project.createdAt?.toDate
        ? project.createdAt
            .toDate()
            .toLocaleDateString()
        : "-";

    projectsTableBody.innerHTML += `
      <tr>
        <td>${project.name || "-"}</td>
        <td>${project.code || "-"}</td>
        <td>${project.status || "-"}</td>
        <td>${assignedUsers || "-"}</td>
        <td>${elevations || "-"}</td>
        <td>${createdDate}</td>
        <td>
          <button
            class="secondary-button"
            onclick="editProject('${projectDoc.id}')">
            Edit
          </button>

          <button
            class="danger-button"
            onclick="deleteProject('${projectDoc.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  dashboardProjectsCount.textContent =
    projectsSnapshot.size;

  sidebarProjectsCount.textContent =
    projectsSnapshot.size;
}

function attachModalFormEvents(action) {
  if (action === "create-user") {
    const createUserForm =
      document.getElementById(
        "admin-create-user-form"
      );

    createUserForm?.addEventListener(
      "submit",
      handleCreateUserDesignSubmit
    );
  }

  if (action === "create-project") {
    const createProjectForm =
      document.getElementById(
        "admin-create-project-form"
      );

    createProjectForm?.addEventListener(
      "submit",
      handleCreateProjectDesignSubmit
    );
  }

  modalContent
    ?.querySelector("[data-close-modal]")
    ?.addEventListener(
      "click",
      closeActionModal
    );
}

function openActionModal(action) {
  if (
    !modalOverlay ||
    !modalContent ||
    !modalTitle ||
    !modalEyebrow
  ) {
    console.error(
      "The administration modal elements were not found."
    );

    return;
  }

  if (action === "create-user") {
    modalEyebrow.textContent =
      "User management";

    modalTitle.textContent =
      "Create user";

    modalContent.innerHTML =
      getCreateUserForm();
  } else if (action === "create-project") {
    modalEyebrow.textContent =
      "Project management";

    modalTitle.textContent =
      "Create project";

    modalContent.innerHTML =
      getCreateProjectForm();
  } else {
    console.warn(
      `Unknown administration action: ${action}`
    );

    return;
  }

  modalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  attachModalFormEvents(action);

  window.setTimeout(() => {
    modalContent
      .querySelector("input, select, textarea")
      ?.focus();
  }, 0);
}

function closeActionModal() {
  if (!modalOverlay || !modalContent) {
    return;
  }

  modalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
  modalContent.innerHTML = "";
}

function handleCreateUserDesignSubmit(event) {
  event.preventDefault();

  const message =
    document.getElementById(
      "create-user-message"
    );

  if (!message) {
    return;
  }

  message.textContent =
    "The Create User interface is ready. The secure backend connection will be added next.";

  message.className =
    "message success";
}

async function handleCreateProjectDesignSubmit(event) {
  event.preventDefault();

  const projectName =
    document
      .getElementById("create-project-name")
      .value
      .trim();

  const projectStatus =
    document
      .getElementById("create-project-status")
      .value;

  const projectCode =
    document
      .getElementById("create-project-code")
      .value
      .trim();

  const elevationStyles =
    document
      .getElementById("create-project-elevations")
      .value
      .split("\n")
      .map(style => style.trim())
      .filter(style => style);

  // Get selected users
  const assignedUserIds = Array.from(
    document.querySelectorAll(
      "#create-project-user-options input[type='checkbox']:checked"
    )
  ).map(checkbox => checkbox.value);

  await addDoc(
    collection(firebaseDb, "projects"),
    {
      name: projectName,
      code: projectCode,
      status: projectStatus,
      elevationStyles,
      assignedUserIds,
      createdAt: new Date()
    }
  );

  alert("Project created successfully");

  closeActionModal();

  if (typeof loadProjects === "function") {
    await loadProjects();
  }
}
/*
 * ============================================================
 * Detail drawer
 * ============================================================
 */

function openDetailDrawer({
  eyebrow = "Details",
  title = "Record details",
  content = ""
} = {}) {
  if (
    !drawer ||
    !drawerOverlay ||
    !drawerContent
  ) {
    return;
  }

  if (drawerEyebrow) {
    drawerEyebrow.textContent =
      eyebrow;
  }

  if (drawerTitle) {
    drawerTitle.textContent =
      title;
  }

  drawerContent.innerHTML =
    content;

  drawerOverlay.classList.remove(
    "hidden"
  );

  drawer.classList.add("is-open");

  drawer.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";
}

function closeDetailDrawer() {
  if (!drawer || !drawerOverlay) {
    return;
  }

  drawer.classList.remove("is-open");

  drawer.setAttribute(
    "aria-hidden",
    "true"
  );

  drawerOverlay.classList.add(
    "hidden"
  );

  document.body.style.overflow = "";
}

/*
 * ============================================================
 * Delete confirmation
 * ============================================================
 */

function openDeleteConfirmation({
  message = "This operation cannot be undone.",
  onConfirm = null
} = {}) {
  if (!deleteModalOverlay) {
    return;
  }

  if (deleteModalMessage) {
    deleteModalMessage.textContent =
      message;
  }

  pendingDeleteHandler =
    typeof onConfirm === "function"
      ? onConfirm
      : null;

  deleteModalOverlay.classList.remove(
    "hidden"
  );

  document.body.style.overflow =
    "hidden";
}

function closeDeleteConfirmation() {
  deleteModalOverlay?.classList.add(
    "hidden"
  );

  pendingDeleteHandler = null;
  document.body.style.overflow = "";
}

/*
 * ============================================================
 * Administrator authentication
 * ============================================================
 */

async function getAdministratorProfile(user) {
  if (!user || !firebaseDb) {
    return null;
  }

  const userReference = doc(
    firebaseDb,
    "users",
    user.uid
  );

  const userSnapshot =
    await getDoc(userReference);

  if (!userSnapshot.exists()) {
    console.warn(
      "No Firestore user profile exists for:",
      user.uid
    );

    return null;
  }

  const profile =
    userSnapshot.data();

  console.log(
    "Administrator profile check:",
    {
      uid: user.uid,
      email: user.email,
      role: profile.role,
      active: profile.active
    }
  );

  const normalizedRole =
    String(profile.role || "")
      .trim()
      .toLowerCase();

  if (normalizedRole !== "admin") {
    return null;
  }

  if (profile.active === false) {
    console.warn(
      "The administrator profile is inactive."
    );

    return null;
  }

  return {
    uid: user.uid,
    ...profile,
    role: normalizedRole
  };
}

function displayAdministratorProfile(
  administrator,
  authenticationUser
) {
  const email =
    administrator.email ||
    authenticationUser.email ||
    "";

  const displayName =
    administrator.displayName ||
    authenticationUser.displayName ||
    email.split("@")[0] ||
    "Administrator";

  if (adminAccountName) {
    adminAccountName.textContent =
      displayName;
  }

  if (adminAccountEmail) {
    adminAccountEmail.textContent =
      email;

    adminAccountEmail.title =
      email;
  }

  if (adminAvatar) {
    adminAvatar.textContent =
      displayName
        .charAt(0)
        .toUpperCase();
  }
}

/*
 * ============================================================
 * Initial dashboard data
 * ============================================================
 */

async function initializeAdminDashboard() {

  await Promise.all([
    loadUsers(),
    loadProjects()
  ]);

}

/*
 * ============================================================
 * Navigation events
 * ============================================================
 */

navigationButtons.forEach((button) => {
  button.addEventListener(
    "click",
    () => {
      navigateToPage(
        button.dataset.adminPage
      );
    }
  );
});

navigationLinks.forEach((button) => {
  button.addEventListener(
    "click",
    () => {
      const targetPage =
        button.dataset.navigateTo;

      if (targetPage) {
        navigateToPage(targetPage);
      }
    }
  );
});

actionButtons.forEach((button) => {
  button.addEventListener(
    "click",
    () => {
      const action =
        button.dataset.action;

      if (action) {
        openActionModal(action);
      }
    }
  );
});

primaryActionButton?.addEventListener(
  "click",
  () => {
    const action =
      primaryActionButton.dataset.action;

    if (action) {
      openActionModal(action);
    }
  }
);

/*
 * ============================================================
 * Modal, drawer and delete events
 * ============================================================
 */

closeModalButton?.addEventListener(
  "click",
  closeActionModal
);

modalOverlay?.addEventListener(
  "click",
  (event) => {
    if (event.target === modalOverlay) {
      closeActionModal();
    }
  }
);

closeDrawerButton?.addEventListener(
  "click",
  closeDetailDrawer
);

drawerOverlay?.addEventListener(
  "click",
  closeDetailDrawer
);

cancelDeleteButton?.addEventListener(
  "click",
  closeDeleteConfirmation
);

confirmDeleteButton?.addEventListener(
  "click",
  async () => {
    if (!pendingDeleteHandler) {
      closeDeleteConfirmation();
      return;
    }

    try {
      confirmDeleteButton.disabled =
        true;

      confirmDeleteButton.textContent =
        "Removing...";

      await pendingDeleteHandler();

      closeDeleteConfirmation();
    } catch (error) {
      console.error(
        "Delete operation failed:",
        error
      );
    } finally {
      confirmDeleteButton.disabled =
        false;

      confirmDeleteButton.textContent =
        "Remove";
    }
  }
);

deleteModalOverlay?.addEventListener(
  "click",
  (event) => {
    if (
      event.target ===
      deleteModalOverlay
    ) {
      closeDeleteConfirmation();
    }
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeActionModal();
    closeDetailDrawer();
    closeDeleteConfirmation();
  }
);

/*
 * ============================================================
 * Search and filter placeholders
 * ============================================================
 */

globalSearchInput?.addEventListener(
  "input",
  (event) => {
    const searchText =
      event.target.value
        .trim()
        .toLowerCase();

    console.log(
      "Global administration search:",
      searchText
    );
  }
);

usersSearchInput?.addEventListener(
  "input",
  () => {
    // User filtering will be added with loadUsers().
  }
);

usersRoleFilter?.addEventListener(
  "change",
  () => {
    // Role filtering will be added with loadUsers().
  }
);

usersStatusFilter?.addEventListener(
  "change",
  () => {
    // Status filtering will be added with loadUsers().
  }
);

projectsSearchInput?.addEventListener(
  "input",
  () => {
    // Project filtering will be added with loadProjects().
  }
);

projectsStatusFilter?.addEventListener(
  "change",
  () => {
    // Project status filtering will be added with loadProjects().
  }
);

requestsSearchInput?.addEventListener(
  "input",
  () => {
    // Request filtering will be added with loadRequests().
  }
);

requestsStatusFilter?.addEventListener(
  "change",
  () => {
    // Request status filtering will be added with loadRequests().
  }
);

requestsProjectFilter?.addEventListener(
  "change",
  () => {
    // Project filtering will be added with loadRequests().
  }
);

/*
 * ============================================================
 * Logout
 * ============================================================
 */

adminLogoutButton?.addEventListener(
  "click",
  async () => {
    const originalText =
      adminLogoutButton.textContent;

    try {
      adminLogoutButton.disabled =
        true;

      adminLogoutButton.textContent =
        "…";

      await signOut(firebaseAuth);

      /*
       * onAuthStateChanged will receive null
       * and redirect to index.html.
       */
    } catch (error) {
      console.error(
        "Administrator logout failed:",
        error
      );

      adminLogoutButton.disabled =
        false;

      adminLogoutButton.textContent =
        originalText || "↪";
    }
  }
);

/*
 * ============================================================
 * Authentication guard
 * ============================================================
 */

setAdminInterfaceEnabled(false);

onAuthStateChanged(
  firebaseAuth,

  async (user) => {
    if (!user) {
      console.log(
        "No authenticated user. Returning to the login page."
      );

      window.location.replace(
        "./index.html"
      );

      return;
    }

    try {
      const administrator =
        await getAdministratorProfile(
          user
        );

      if (!administrator) {
        console.warn(
          "Access denied. The current user is not an administrator."
        );

        window.location.replace(
          "./index.html"
        );

        return;
      }

      currentAdministrator =
        administrator;

      console.log(
        "Administrator access granted:",
        {
          uid: administrator.uid,
          email: administrator.email,
          role: administrator.role
        }
      );

      displayAdministratorProfile(
        administrator,
        user
      );

      setAdminInterfaceEnabled(true);
      navigateToPage("dashboard");

      await initializeAdminDashboard();
    } catch (error) {
      console.error(
        "Administrator verification failed:",
        error
      );

      window.location.replace(
        "./index.html"
      );
    }
  },

  (error) => {
    console.error(
      "Authentication state could not be determined:",
      error
    );

    window.location.replace(
      "./index.html"
    );
  }
);
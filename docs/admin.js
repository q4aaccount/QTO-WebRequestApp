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

const drawer =
  document.getElementById("admin-detail-drawer");

const drawerOverlay =
  document.getElementById("admin-drawer-overlay");

const closeDrawerButton =
  document.getElementById("close-admin-drawer");

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
    primaryAction: "Review requests",
    action: ""
  }
};

function navigateToPage(pageName) {
  const configuration =
    pageConfiguration[pageName];

  if (!configuration) return;

  navigationButtons.forEach((button) => {
    const isActive =
      button.dataset.adminPage === pageName;

    button.classList.toggle(
      "is-active",
      isActive
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

  pageTitle.textContent =
    configuration.title;

  if (configuration.action) {
    primaryActionButton.classList.remove(
      "hidden"
    );

    primaryActionButton.dataset.action =
      configuration.action;

    primaryActionButton.innerHTML =
      configuration.primaryAction ===
      "Create user"
        ? "<span>＋</span> Create user"
        : "<span>＋</span> Create project";
  } else {
    primaryActionButton.classList.add(
      "hidden"
    );
  }
}

function getCreateUserForm() {
  return `
    <form id="admin-create-user-form" class="admin-form">
      <div class="form-grid">
        <label>
          Full name

          <input
            id="create-user-name"
            type="text"
            placeholder="Enter the user's name"
            required
          />
        </label>

        <label>
          Email

          <input
            id="create-user-email"
            type="email"
            placeholder="user@example.com"
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
          required
        />
      </label>

      <p class="form-help">
        In the functional version, account creation will be
        completed through a secure backend using Firebase
        Admin services.
      </p>

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

function getCreateProjectForm() {
  return `
    <form id="admin-create-project-form" class="admin-form">
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
            User selection will appear here after Firebase
            is connected.
          </p>
        </div>
      </fieldset>

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

function openActionModal(action) {
  if (action === "create-user") {
    modalEyebrow.textContent =
      "User management";

    modalTitle.textContent =
      "Create user";

    modalContent.innerHTML =
      getCreateUserForm();
  }

  if (action === "create-project") {
    modalEyebrow.textContent =
      "Project management";

    modalTitle.textContent =
      "Create project";

    modalContent.innerHTML =
      getCreateProjectForm();
  }

  modalOverlay.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  modalContent
    .querySelector("input, select, textarea")
    ?.focus();

  modalContent
    .querySelector("[data-close-modal]")
    ?.addEventListener(
      "click",
      closeActionModal
    );
}

function closeActionModal() {
  modalOverlay.classList.add("hidden");

  document.body.style.overflow = "";

  modalContent.innerHTML = "";
}

function closeDetailDrawer() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");

  drawerOverlay.classList.add("hidden");

  document.body.style.overflow = "";
}

navigationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navigateToPage(
      button.dataset.adminPage
    );
  });
});

navigationLinks.forEach((button) => {
  button.addEventListener("click", () => {
    navigateToPage(
      button.dataset.navigateTo
    );
  });
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openActionModal(
      button.dataset.action
    );
  });
});

primaryActionButton?.addEventListener(
  "click",
  () => {
    openActionModal(
      primaryActionButton.dataset.action
    );
  }
);

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

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  closeActionModal();
  closeDetailDrawer();
});

navigateToPage("dashboard");
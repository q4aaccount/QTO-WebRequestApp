import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import {
  doc,
  getDoc,
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

/*
 * ============================================================
 * Firebase initialization
 * ============================================================
 */

const firebaseConfig = window.f*rebaseConfig || {};

const isFireb*seConfigured = Boolean(
  firebase*onfig.apiKey &&
  firebaseConfig.a*iKey !== "YOUR_API_KEY"
);

if (!i*FirebaseConfigured) {
  console.er*or(
    "Firebase configuration is missing. Check firebase-config.js."
  );
}

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getFirestore(firebaseApp);

/*
 * ============================================================
 * DOM elements
 * ============================================================
 */

// Main navigation
const n*vigationButtons = Array.from(
  do*ument.querySelectorAll("[data-admin-page]")
);

const administrationP*ges = Array.from(
  document.query*electorAll("[data-admin-panel]")
)*

const pageTitle =
  document.get*lementById("admin-page-title");

c*nst primaryActionButton =
  docume*t.getElementById("admin-primary-ac*ion");

const navigationLinks = Ar*ay.from(
  document.querySelectorA*l("[data-navigate-to]")
);

const *ctionButtons = Array.from(
  docum*nt.querySelectorAll("[data-action]*)
);

// Admin account area
const *dminAccountName =
  document.getEl*mentById("admin-account-name");

c*nst adminAccountEmail =
  document*getElementById("admin-account-emai*");

const adminAvatar =
  documen*.getElementById("admin-avatar");

*onst adminLogoutButton =
  documen*.getElementById("admin-logout-butt*n");

// Modal
const modalOverlay *
  document.getElementById("admin-*odal-overlay");

const modalTitle *
  document.getElementById("admin-*odal-title");

const modalEyebrow *
  document.getElementById("admin-*odal-eyebrow");

const modalConten* =
  document.getElementById("admi*-modal-content");

const closeModa*Button =
  document.getElementById*"close-admin-modal");

// Detail d*awer
const drawer =
  document.get*lementById("admin-detail-drawer");*
const drawerOverlay =
  document.*etElementById("admin-drawer-overla*");

const closeDrawerButton =
  d*cument.getElementById("close-admin*drawer");

const drawerEyebrow =
 *document.getElementById("drawer-ey*brow");

const drawerTitle =
  doc*ment.getElementById("drawer-title"*;

const drawerContent =
  documen*.getElementById("admin-drawer-cont*nt");

// Delete confirmation
cons* deleteModalOverlay =
  document.g*tElementById("delete-modal-overlay*);

const deleteModalMessage =
  d*cument.getElementById("delete-moda*-message");

const cancelDeleteBut*on =
  document.getElementById("ca*cel-delete-button");

const confir*DeleteButton =
  document.getEleme*tById("confirm-delete-button");

/* Dashboard and table elements
cons* dashboardUsersCount =
  document.*etElementById("dashboard-users-cou*t");

const dashboardProjectsCount*=
  document.getElementById("dashb*ard-projects-count");

const dashb*ardRequestsCount =
  document.getE*ementById("dashboard-requests-coun*");

const dashboardPendingCount =*  document.getElementById("dashboa*d-pending-count");

const sidebarU*ersCount =
  document.getElementBy*d("sidebar-users-count");

const s*debarProjectsCount =
  document.ge*ElementById("sidebar-projects-coun*");

const sidebarRequestsCount =
* document.getElementById("sidebar-*equests-count");

const usersTable*ody =
  document.getElementById("a*min-users-table-body");

const pro*ectsTableBody =
  document.getElem*ntById("admin-projects-table-body"*;

const requestsTableBody =
  doc*ment.getElementById("admin-request*-table-body");

// Search and filt*rs
const globalSearchInput =
  doc*ment.getElementById("admin-global-*earch-input");

const usersSearchI*put =
  document.getElementById("u*ers-search-input");

const usersRo*eFilter =
  document.getElementByI*("users-role-filter");

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
    primaryAction: "Review requests",
    action: ""
  }
};

/*
 * ============================================================
 * General utility functions
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

function navigateToPage(*ageName) {
  const configuration =*    pageConfiguration[pageName];

* if (!configuration) {
    console*warn(
      `Unknown administratio* page: ${pageName}`
    );

    re*urn;
  }

  navigationButtons.forE*ch((button) => {
    const isActiv* =
      button.dataset.adminPage *== pageName;

    button.classList*toggle(
      "is-active",
      i*Active
    );

    button.setAttri*ute(
      "aria-selected",
      *tring(isActive)
    );
  });

  ad*inistrationPages.forEach((page) =>*{
    const isActive =
      page.*ataset.adminPanel === pageName;

 *  page.classList.toggle(
      "is*active",
      isActive
    );
  }*;

  if (pageTitle) {
    pageTitl*.textContent =
      configuration*title;
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
* return `
    <form
      id="admi*-create-user-form"
      class="ad*in-form"
    >
      <div class="f*rm-grid">
        <label>
        * Full name

          <input
     *      id="create-user-name"
      *     type="text"
            place*older="Enter the user's name"
    *       autocomplete="name"
       *    required
          />
        */label>

        <label>
         *Email

          <input
          * id="create-user-email"
          * type="email"
            placehol*er="user@example.com"
            *utocomplete="email"
            re*uired
          />
        </label*
      </div>

      <div class="f*rm-grid">
        <label>
        * Role

          <select id="creat*-user-role">
            <option v*lue="user">
              User
   *        </option>

            <op*ion value="admin">
              A*ministrator
            </option>
*         </select>
        </label*

        <label>
          Accoun* status

          <select id="cre*te-user-status">
            <opti*n value="active">
              Ac*ive
            </option>

       *    <option value="inactive">
    *         Inactive
            </op*ion>
          </select>
        <*label>
      </div>

      <label>*        Temporary password

      * <input
          id="create-user-*assword"
          type="password"*          minlength="6"
          *laceholder="Minimum 6 characters"
*         autocomplete="new-passwor*"
          required
        />
  *   </label>

      <p class="form-*elp">
        The form is currentl* part of the interface design.
   *    Secure Authentication account *reation will be connected
        *hrough a backend service in the next implementation step.
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

function getCreateProjectForm()*{
  return `
    <form
      id="a*min-create-project-form"
      cla*s="admin-form"
    >
      <label>*        Project name

        <inp*t
          id="create-project-nam*"
          type="text"
          *laceholder="Enter a project name"
*         required
        />
     *</label>

      <div class="form-g*id">
        <label>
          Pro*ect status

          <select id="*reate-project-status">
           *<option value="active">
          *   Active
            </option>

 *          <option value="inactive"*
              Inactive
          * </option>

            <option va*ue="completed">
              Comp*eted
            </option>
       *  </select>
        </label>

    *   <label>
          Project code
*          <input
            id="c*eate-project-code"
            typ*="text"
            placeholder="E*ample: NT-001"
          />
      * </label>
      </div>

      <lab*l>
        Elevations

        <te*tarea
          id="create-project*elevations"
          rows="5"
   *      placeholder="Enter one eleva*ion per line"
          required
 *      ></textarea>
      </label>
*      <fieldset>
        <legend>A*sign users</legend>

        <div
*         id="create-project-user-o*tions"
          class="selection-*ist"
        >
          <p class=*form-help">
            Registered*users will appear here after the u*ers
            collection is conn*cted to this page.
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
 * Modal controls
 * ============================================================
 */

function attachModalF*rmEvents(action) {
  if (action ==* "create-user") {
    const create*serForm =
      document.getElemen*ById(
        "admin-create-user-f*rm"
      );

    createUserForm?.*ddEventListener(
      "submit",
 *    handleCreateUserDesignSubmit
 *  );
  }

  if (action === "create*project") {
    const createProjec*Form =
      document.getElementBy*d(
        "admin-create-project-f*rm"
      );

    createProjectFor*?.addEventListener(
      "submit"*
      handleCreateProjectDesignSu*mit
    );
  }

  modalContent
   *?.querySelector("[data-close-modal]")
    ?.addEventListener(
      "*lick",
      closeActionModal
    *;
}

function openActionModal(acti*n) {
  if (
    !modalOverlay ||
 *  !modalContent ||
    !modalTitle*||
    !modalEyebrow
  ) {
    con*ole.error(
      "The administrati*n modal elements were not found."
*   );

    return;
  }

  if (acti*n === "create-user") {
    modalEy*brow.textContent =
      "User man*gement";

    modalTitle.textConte*t =
      "Create user";

    moda*Content.innerHTML =
      getCreat*UserForm();
  } else if (action ==* "create-project") {
    modalEyeb*ow.textContent =
      "Project ma*agement";

    modalTitle.textCont*nt =
      "Create project";

    *odalContent.innerHTML =
      getC*eateProjectForm();
  } else {
    *onsole.warn(
      `Unknown admini*tration action: ${action}`
    );
*    return;
  }

  modalOverlay.cl*ssList.remove("hidden");
  documen*.body.style.overflow = "hidden";

* attachModalFormEvents(action);

 *window.setTimeout(() => {
    moda*Content
      .querySelector("inpu*, select, textarea")
      ?.focus*);
  }, 0);
}

function closeActio*Modal() {
  if (!modalOverlay || !*odalContent) {
    return;
  }

  *odalOverlay.classList.add("hidden"*;
  document.body.style.overflow =*"";
  modalContent.innerHTML = "";*}

function handleCreateUserDesign*ubmit(event) {
  event.preventDefa*lt();

  const message =
    docum*nt.getElementById(
      "create-u*er-message"
    );

  if (message)*{
    message.textContent =
      *The Create User interface is ready. The secure backend connection will be added next.";

    message.className =
      "message success";
  }
}

function handleCreateProjectDesignSubmit(event) {
  event.preventDefault();

  const message =
    document.getElementById(
      "create-project-message"
    );

  if (message) {
    message.textContent =
      "The Create Project interface is ready. Firestore project creation will be added next.";

    message.className =
      "message success";
  }
}

/*
 * ============================================================
 * Detail drawer controls
 * ============================================================
 */

function openDetailDrawer({
  e*ebrow = "Details",
  title = "Reco*d details",
  content = ""
} = {})*{
  if (
    !drawer ||
    !drawe*Overlay ||
    !drawerContent
  ) *
    return;
  }

  if (drawerEyeb*ow) {
    drawerEyebrow.textConten* = eyebrow;
  }

  if (drawerTitle* {
    drawerTitle.textContent = title;
  }

  drawerContent.innerHTML = content;

  drawerOverlay.classList.remove("hidden");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeDetailDrawer() {
  if (!drawer || !drawerOverlay) {
    return;
  }

  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");

  drawerOverlay.classList.add("hidden");

  document.body.style.overflow = "";
}

/*
 * ============================================================
 * Delete confirmation controls
 * ============================================================
 */

function openDeleteConfirmation*{
  message = "This operation cann*t be undone.",
  onConfirm = null
} = {}) {
  if (!deleteModalOverlay) return;

  if (deleteModalMessage) {
    deleteModalMessage.textContent = message;
  }

  pendingDeleteHandler =
    typeof onConfirm === "function"
      ? onConfirm
      : null;

  deleteModalOverlay.classList.remove(
    "hidden"
  );

  document.body.style.overflow = "hidden";
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
 * Administrator authentication and authorization
 * ============================================================
 */

async function getAdmi*istratorProfile(user) {
  if (!use* || !firebaseDb) {
    return null*
  }

  const userReference = doc(*    firebaseDb,
    "users",
    u*er.uid
  );

  const userSnapshot *
    await getDoc(userReference);
*  if (!userSnapshot.exists()) {
  * console.warn(
      "No Firestore*user profile exists for:",
      u*er.uid
    );

    return null;
  *

  const profile = userSnapshot.d*ta();

  console.log("Administrato* profile check:", {
    uid: user.*id,
    email: user.email,
    rol*: profile.role,
    active: profil*.active
  });

  const normalizedR*le =
    String(profile.role || ""*
      .trim()
      .toLowerCase(*;

  if (normalizedRole !== "admin*) {
    return null;
  }

  if (pr*file.active === false) {
    conso*e.warn(
      "The administrator p*ofile is inactive."
    );

    re*urn null;
  }

  return {
    uid:*user.uid,
    ...profile,
    role* normalizedRole
  };
}

function d*splayAdministratorProfile(
  admin*strator,
  authenticationUser
) {
* const email =
    administrator.e*ail ||
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
 * Data loading placeholders
 * ============================================================
 *
 * These will be replaced with Firestore loading functions next.
 */

async function initializeAdminD*shboard() {
  // Keep temporary co*nts at zero until Firestore loadin* is added.
  if (dashboardUsersCou*t) {
    dashboardUsersCount.textContent = "0";
  }

  if (dashboardProjectsCount) {
    dashboardProjectsCount.textContent = "0";
  }

  if (dashboardRequestsCount) {
    dashboardRequestsCount.textContent = "0";
  }

  if (dashboardPendingCount) {
    dashboardPendingCount.textContent = "0";
  }

  if (sidebarUsersCount) {
    sidebarUsersCount.textContent = "0";
  }

  if (sidebarProjectsCount) {
    sidebarProjectsCount.textContent = "0";
  }

  if (sidebarRequestsCount) {
    sidebarRequestsCount.textContent = "0";
  }

  /*
   * Firestore functions will be connected here:
   *
   * await Promise.all([
   *   loadUsers(),
   *   loadProjects(),
   *   loadRequests()
   * ]);
   */
}

/*
 * ============================================================
 * Navigation event listeners
 * ============================================================
 */

navigationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navigateToPage(
      button.dataset.adminPage
    );
  });
});

navigationLinks.forEach((button) => {
  button.addEventListener("click", () => {
    const targetPage =
      button.dataset.navigateTo;

    if (targetPage) {
      navigateToPage(targetPage);
    }
  });
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action =
      button.dataset.action;

    if (action) {
      openActionModal(action);
    }
  });
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
 * Modal and drawer event listeners
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
      confirmDeleteButton.disabled = true;
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
      confirmDeleteButton.disabled = false;
      confirmDeleteButton.textContent =
        "Remove";
    }
  }
);

deleteModalOverlay?.addEventListener(
  "click",
  (event) => {
    if (event.target === deleteModalOverlay) {
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
    // User role filtering will be added with loadUsers().
  }
);

usersStatusFilter?.addEventListener(
  "change",
  () => {
    // User status filtering will be added with loadUsers().
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
    // Request project filtering will be added with loadRequests().
  }
);

/*
 * ============================================================
 * Administrator logout
 * ============================================================
 */

adminLogoutButton?.addEventListener(
  "click",
  async () => {
    if (!firebaseAuth) return;

    const originalText =
      adminLogoutButton.textContent;

    try {
      adminLogoutButton.disabled = true;
      adminLogoutButton.textContent = "…";

      await signOut(firebaseAuth);

      /*
       * onAuthStateChanged will detect the logout and redirect
       * to index.html.
       */
    } catch (error) {
      console.error(
        "Administrator logout failed:",
        error
      );

      adminLogoutButton.disabled = false;
      adminLogoutButton.textContent =
        originalText || "↪";
    }
  }
);

/*
 * ============================================================
 * Authentication guard
 * ============================================================
 *
 * This must remain near the bottom of the file.
 * The dashboard is enabled only after the current user is
 * verified as an administrator.
 */

setAdminInterfaceEnabled(false);

onAuthStateChanged(
  firebaseAuth,

  async (user) => {
    if (!user) {
      console.log(
        "No authenticated user. Returning to the login page."
      );

      window.location.replace("./index.html");
      return;
    }

    try {
      const administrator =
        await getAdministratorProfile(user);

      if (!administrator) {
        console.warn(
          "Access denied. The current user is not an administrator."
        );

        window.location.replace("./index.html");
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

      window.location.replace("./index.html");
    }
  },

  (error) => {
    console.error(
      "Authentication state could not be determined:",
      error
    );

    window.location.replace("./index.html");
  }
);
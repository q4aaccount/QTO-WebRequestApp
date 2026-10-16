import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-analytics.js";
import { 
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const authPanel = document.getElementById("auth-panel");
  const projectSelect = document.getElementById("project-select");
  const elevationSelect = document.getElementById("elevation-select");
  const scopeSelect = document.getElementById("scope-select");
  const interiorOptionsWrapper = document.getElementById("interior-options-wrapper");
  const interiorOptions = document.getElementById("interior-options");
  const requestPanel = document.getElementById("request-panel");
  const form = document.getElementById("request-form");
  const formMessage = document.getElementById("form-message");
  const historyList = document.getElementById("history-request-list");
  const slideshow = document.querySelector("[data-slideshow]");
  const galleryTitle = document.getElementById("gallery-title");
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  const authForm = document.getElementById("auth-form");
  const authTitle = document.getElementById("auth-title");
  const authSubmit = document.getElementById("auth-submit");
  const authToggle = document.getElementById("auth-toggle");
  const authMessage = document.getElementById("auth-message");
  const userAccount = document.getElementById("user-account");
  const accountEmail = document.getElementById("account-email");
   const accountName = document.getElementById("account-name");
      const accountAvatar = document.getElementById("account-avatar");
  const authEmail = document.getElementById("auth-email");
  const authPassword = document.getElementById("auth-password");
  const signOutButton = document.getElementById("sign-out-btn");

  const defaultProjectData = {
    "North Tower": {
      elevations: ["Elevation A", "Elevation B", "Elevation C"]
    },
    "Harbor Residences": {
      elevations: ["Elevation 1", "Elevation 2"]
    },
    "Riverfront Campus": {
      elevations: ["Classic", "Modern", "Premium"]
    },
    "Coastal Plaza": {
      elevations: ["Elevation South", "Elevation North"]
    }
  };
  let projectData = { ...defaultProjectData };

  let authMode = "login";
  let currentUser = null;
  let firebaseApp = null;
  let firebaseAuth = null;
  let firebaseDb = null;
  let firebaseAnalytics = null;
  let requests = [];
  let unsubscribeRequests = null;

  const firebaseConfig = window.firebaseConfig || {};
  const isFirebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY");

  function setFormMessage(element, text, isError = false) {
    if (!element) return;
    element.textContent = text;
    element.className = `message ${isError ? "error" : "success"}`;
    element.classList.remove("hidden");
  }

  function hideFormMessage(element) {
    if (!element) return;
    element.classList.add("hidden");
    element.textContent = "";
  }

  function showAuthMessage(text, isError = false) {
    setFormMessage(authMessage, text, isError);
  }

  function hideAuthMessage() {
    hideFormMessage(authMessage);
  }

  function setAuthMode(mode) {
    authMode = mode;
    const isLogin = mode === "login";
    authTitle.textContent = isLogin ? "Sign in to continue" : "Create your account";
    authSubmit.textContent = isLogin ? "Sign in" : "Create account";
    authToggle.textContent = isLogin ? "Create account" : "Back to sign in";
    authPassword.setAttribute("minlength", isLogin ? "6" : "6");
  }

function toggleAuthenticatedState(user) {
  const isLoggedIn = Boolean(user);

  console.log("Authentication state:", {
    isLoggedIn,
    email: user?.email,
    displayName: user?.displayName
  });

  if (!authPanel || !requestPanel) {
    console.error("Authentication or request panel was not found.", {
      authPanel,
      requestPanel
    });

    return;
  }

  // Show login panel only when signed out.
  authPanel.classList.toggle("hidden", isLoggedIn);

  // Show request panel only when signed in.
  requestPanel.classList.toggle("hidden", !isLoggedIn);

  // Show sidebar account only when signed in.
  userAccount?.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    const email = user.email || "";

    // Firebase displayName may be empty for email/password accounts.
    // Use the part before @ as a fallback.
    const fallbackName =
      email.split("@")[0] || "Authenticated user";

    const displayName =
      user.displayName || fallbackName;

    if (accountName) {
      accountName.textContent = displayName;
    }

    if (accountEmail) {
      accountEmail.textContent = email;
      accountEmail.title = email;
    }

    if (accountAvatar) {
      accountAvatar.textContent =
        displayName.charAt(0).toUpperCase();
    }

    authForm?.reset();
    hideAuthMessage();
    hideFormMessage(formMessage);
  } else {
    if (accountName) {
      accountName.textContent = "User";
    }

    if (accountEmail) {
      accountEmail.textContent = "";
      accountEmail.removeAttribute("title");
    }

    if (accountAvatar) {
      accountAvatar.textContent = "U";
    }

    requests = [];
    renderRequests();
    hideFormMessage(formMessage);
  }
}
 
 function initializeFirebase() {
    if (!isFirebaseReady) {
      showAuthMessage(
        "Add your Firebase web config in docs/firebase-config.js before using sign-in.",
        true
      );
      return false;
    }

    try {
      firebaseApp = initializeApp(firebaseConfig);
      firebaseAuth = getAuth(firebaseApp);
      firebaseDb = getFirestore(firebaseApp);
      isAnalyticsSupported()
        .then((supported) => {
          if (supported) {
            firebaseAnalytics = getAnalytics(firebaseApp);
          }
        })
        .catch((error) => {
          console.warn("Firebase analytics is unavailable:", error);
        });
      return true;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      showAuthMessage("Firebase could not be initialized. Check your project settings.", true);
      return false;
    }
  } 

async function createUserProfile(user) {
  if (!user || !firebaseDb) {
    throw new Error(
      "The authenticated user or Firestore is unavailable."
    );
  }

  const email = user.email || "";

  const displayName =
    user.displayName ||
    email.split("@")[0] ||
    "User";

  const userReference = doc(
    firebaseDb,
    "users",
    user.uid
  );

  await setDoc(userReference, {
    uid: user.uid,
    email,
    displayName,
    role: "user",
    active: true,
    createdAt: serverTimestamp()
  });
}

 function formatRequestDate(timestamp) {
    if (!timestamp) return "Just now";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function renderRequests() {
    if (!historyList) return;

    const sortedRequests = [...requests].sort((a, b) => {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    if (!sortedRequests.length) {
      historyList.innerHTML = '<li class="empty-state">No requests saved yet.</li>';
      return;
    }

    historyList.innerHTML = sortedRequests
      .map((request) => `
        <li class="request-item">
          <div class="request-header">
            <div>
              <strong>${request.project}</strong>
              <div class="request-meta">${request.elevation} • ${request.scope}${request.interiorOption ? ` • ${request.interiorOption}` : ""}</div>
            </div>
            <span class="request-eta">${formatRequestDate(request.createdAt)}</span>
          </div>
        </li>
      `)
      .join("");
  }

  function listenForUserRequests(user) {
    if (unsubscribeRequests) {
      unsubscribeRequests();
      unsubscribeRequests = null;
    }

    if (!user || !firebaseDb) {
      requests = [];
      renderRequests();
      return;
    }

    const q = query(collection(firebaseDb, "projectRequests"), where("uid", "==", user.uid));
    unsubscribeRequests = onSnapshot(
      q,
      (snapshot) => {
        requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        renderRequests();
      },
      (error) => {
        console.error("Firestore request listener failed:", error);
        requests = [];
        renderRequests();
        setFormMessage(formMessage, "Unable to load your saved requests right now.", true);
      }
    );
  }

  async function loadProjectData() {
    if (!firebaseDb || !projectSelect) return;

    try {
      const snapshot = await getDocs(collection(firebaseDb, "projects"));
      const firestoreProjects = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const projectName = data.name || data.projectName || doc.id;
        firestoreProjects[projectName] = {
          elevations: Array.isArray(data.elevations) ? data.elevations : defaultProjectData[projectName]?.elevations || []
        };
      });

      if (Object.keys(firestoreProjects).length) {
        projectData = firestoreProjects;
      }
    } catch (error) {
      console.warn("Project data not available from Firestore, using defaults.", error);
      projectData = { ...defaultProjectData };
    }

    populateProjects();
  }

  function populateProjects() {
    if (!projectSelect) return;
    projectSelect.innerHTML = '<option value="">Select a project</option>';
    Object.keys(projectData).forEach((projectName) => {
      const option = document.createElement("option");
      option.value = projectName;
      option.textContent = projectName;
      projectSelect.appendChild(option);
    });
    updateOptions();
  }

  function updateInteriorOptions() {
    if (!scopeSelect || !interiorOptionsWrapper || !interiorOptions) return;

    const selectedScope = scopeSelect.value;
    const showInterior = selectedScope === "Interior" || selectedScope === "Both";

    interiorOptionsWrapper.classList.toggle("hidden", !showInterior);
    interiorOptions.required = showInterior;
  }

  function updateOptions() {
    if (!projectSelect || !elevationSelect) return;

    const selectedProject = projectSelect.value;
    const selectedData = projectData[selectedProject];

    elevationSelect.innerHTML = '<option value="">Select an elevation style</option>';

    if (!selectedData) return;

    selectedData.elevations.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      elevationSelect.appendChild(option);
    });
  }

  function setActiveTab(tabName) {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.dataset.panel === tabName;
      panel.classList.toggle("is-active", isActive);
    });
  }

  function initSlideshow() {
    if (!slideshow) return;

    const slides = Array.from(slideshow.querySelectorAll(".slide"));
    const dots = Array.from(slideshow.querySelectorAll(".slide-dot"));
    if (!slides.length) return;

    let activeIndex = 0;
    let timerId = null;
    const intervalMs = 4500;

    const renderSlide = (index) => {
      activeIndex = index;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
      if (galleryTitle) {
        galleryTitle.textContent = slides[activeIndex]?.dataset.title || "Elevation concepts";
      }
    };

    const start = () => {
      if (slides.length < 2 || timerId) return;
      timerId = window.setInterval(() => {
        const next = (activeIndex + 1) % slides.length;
        renderSlide(next);
      }, intervalMs);
    };

    const stop = () => {
      if (!timerId) return;
      clearInterval(timerId);
      timerId = null;
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const target = Number(dot.getAttribute("data-slide-to"));
        if (Number.isNaN(target)) return;
        renderSlide(target);
      });
    });

    slideshow.addEventListener("mouseenter", stop);
    slideshow.addEventListener("mouseleave", start);

    renderSlide(0);
    start();
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    if (!firebaseAuth || !isFirebaseReady) {
      showAuthMessage("Complete your Firebase configuration in docs/firebase-config.js to sign in.", true);
      return;
    }

    const email = authEmail.value.trim();
    const password = authPassword.value.trim();

    if (!email || !password) {
      showAuthMessage("Please enter both your email and password.", true);
      return;
    }

    try {
      hideAuthMessage();
if (authMode === "login") {
  await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );
} else {
  const userCredential =
    await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

  await createUserProfile(
    userCredential.user
  );
}
``
    } catch (error) {
      const message = error?.message || "Authentication failed.";
      showAuthMessage(message, true);
    }
  }

async function ensureUserProfile(user) {
  if (!user || !firebaseDb) {
    return;
  }

  const userReference = doc(
    firebaseDb,
    "users",
    user.uid
  );

  const userSnapshot =
    await getDoc(userReference);

  if (!userSnapshot.exists()) {
    await createUserProfile(user);
  }
}

async function handleSignOut() {
  if (!firebaseAuth) {
    console.error("Firebase Authentication is unavailable.");
    return;
  }

  if (signOutButton) {
    signOutButton.disabled = true;
    signOutButton.textContent = "Logging out...";
  }

  try {
    await signOut(firebaseAuth);

    // onAuthStateChanged will automatically:
    // 1. Show the login panel.
    // 2. Hide the request panel.
    // 3. Hide the sidebar account.
    // 4. Clear user request history.
  } catch (error) {
    console.error("Sign out failed:", error);

    setFormMessage(
      formMessage,
      "Unable to log out. Please try again.",
      true
    );
  } finally {
    if (signOutButton) {
      signOutButton.disabled = false;
      signOutButton.textContent = "Log out";
    }
  }
}

  function handleRequestSubmit(event) {
    event.preventDefault();

    if (!currentUser) {
      setFormMessage(formMessage, "Please sign in before submitting a request.", true);
      return;
    }

    if (!projectSelect || !elevationSelect || !scopeSelect) return;

    if (!projectSelect.value || !elevationSelect.value || !scopeSelect.value) {
      setFormMessage(formMessage, "Please select a project, elevation style, and interior/exterior option.", true);
      return;
    }

    if ((scopeSelect.value === "Interior" || scopeSelect.value === "Both") && (!interiorOptions || !interiorOptions.value)) {
      setFormMessage(formMessage, "Please choose an interior option.", true);
      return;
    }

    const request = {
      project: projectSelect.value,
      elevation: elevationSelect.value,
      scope: scopeSelect.value,
      interiorOption: interiorOptions?.value || "",
      uid: currentUser.uid,
      email: currentUser.email,
      createdAt: serverTimestamp()
    };

    if (!firebaseDb) {
      setFormMessage(formMessage, "Firebase Firestore is not configured yet.", true);
      return;
    }

    addDoc(collection(firebaseDb, "projectRequests"), request)
      .then(() => {
        setFormMessage(formMessage, `Request submitted for ${request.project} • ${request.elevation} • ${request.scope}.`);
        form.reset();
        projectSelect.selectedIndex = 0;
        scopeSelect.selectedIndex = 0;
        updateOptions();
        updateInteriorOptions();
      })
      .catch((error) => {
        console.error("Save request failed:", error);
        setFormMessage(formMessage, "Request could not be saved. Please try again.", true);
      });
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  if (projectSelect) {
    populateProjects();
    projectSelect.addEventListener("change", updateOptions);
  }

  if (scopeSelect) {
    scopeSelect.addEventListener("change", updateInteriorOptions);
  }

  if (form) {
    form.addEventListener("submit", handleRequestSubmit);
  }

  if (authForm) {
    authForm.addEventListener("submit", handleAuthSubmit);
  }

  if (authToggle) {
    authToggle.addEventListener("click", () => {
      hideAuthMessage();
      setAuthMode(authMode === "login" ? "signup" : "login");
    });
  }

  if (signOutButton) {
    signOutButton.addEventListener("click", handleSignOut);
  }

  renderRequests();
  setActiveTab("home");
  updateOptions();
  updateInteriorOptions();
  initSlideshow();
  setAuthMode("login");

if (initializeFirebase()) {
  onAuthStateChanged(
    firebaseAuth,

    async (user) => {
      currentUser = user;

      console.log("Authentication state:", {
        signedIn: Boolean(user),
        email: user?.email,
        uid: user?.uid
      });

      toggleAuthenticatedState(user);

      if (user) {
		  await ensureUserProfile(user);
        await loadProjectData();
        listenForUserRequests(user);
      } else {
        // Stop the existing Firestore listener after sign-out.
        if (unsubscribeRequests) {
          unsubscribeRequests();
          unsubscribeRequests = null;
        }

        requests = [];
        renderRequests();
      }
    },

    (error) => {
      console.error("Authentication state error:", error);

      currentUser = null;
      toggleAuthenticatedState(null);

      showAuthMessage(
        "Unable to determine your authentication status.",
        true
      );
    }
  );
};
});

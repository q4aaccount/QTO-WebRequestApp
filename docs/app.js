document.addEventListener("DOMContentLoaded", () => {
  const projectSelect = document.getElementById("project-select");
  const elevationSelect = document.getElementById("elevation-select");
  const scopeSelect = document.getElementById("scope-select");
  const interiorOptionsWrapper = document.getElementById("interior-options-wrapper");
  const interiorOptions = document.getElementById("interior-options");
  const form = document.getElementById("request-form");
  const formMessage = document.getElementById("form-message");
  const historyList = document.getElementById("history-request-list");
  const slideshow = document.querySelector("[data-slideshow]");
  const galleryTitle = document.getElementById("gallery-title");
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

  const projectData = {
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

  const requests = [
    {
      project: "North Tower",
      elevation: "Elevation B",
      scope: "Exterior",
      eta: "1d 4h remaining"
    },
    {
      project: "Harbor Residences",
      elevation: "Elevation 1",
      scope: "Interior",
      eta: "2d 8h remaining"
    },
    {
      project: "Riverfront Campus",
      elevation: "Premium",
      scope: "Both",
      eta: "0h remaining"
    },
    {
      project: "Coastal Plaza",
      elevation: "Elevation South",
      scope: "Exterior",
      eta: "3d 6h remaining"
    }
  ];

  const renderRequests = () => {
    if (!historyList) return;

    historyList.innerHTML = requests
      .slice()
      .reverse()
      .map((request) => `
        <li class="request-item">
          <div class="request-header">
            <div>
              <strong>${request.project}</strong>
              <div class="request-meta">${request.elevation} • ${request.scope}</div>
            </div>
            <span class="request-eta">ETA: ${request.eta}</span>
          </div>
        </li>
      `)
      .join("");
  };

  const populateProjects = () => {
    if (!projectSelect) return;
    Object.keys(projectData).forEach((projectName) => {
      const option = document.createElement("option");
      option.value = projectName;
      option.textContent = projectName;
      projectSelect.appendChild(option);
    });
  };

  const updateInteriorOptions = () => {
    if (!scopeSelect || !interiorOptionsWrapper || !interiorOptions) return;

    const selectedScope = scopeSelect.value;
    const showInterior = selectedScope === "Interior" || selectedScope === "Both";

    interiorOptionsWrapper.classList.toggle("hidden", !showInterior);
    interiorOptions.required = showInterior;
  };

  const updateOptions = () => {
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
  };

  const setActiveTab = (tabName) => {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.dataset.panel === tabName;
      panel.classList.toggle("is-active", isActive);
    });
  };

  const initSlideshow = () => {
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
  };

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

  renderRequests();
  setActiveTab("home");
  updateOptions();
  updateInteriorOptions();
  initSlideshow();

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!projectSelect || !elevationSelect || !scopeSelect) return;

    if (!projectSelect.value || !elevationSelect.value || !scopeSelect.value) {
      formMessage.textContent = "Please select a project, elevation style, and interior/exterior option.";
      formMessage.classList.remove("hidden");
      return;
    }

    if (scopeSelect.value === "Interior" || scopeSelect.value === "Both") {
      if (!interiorOptions || !interiorOptions.value) {
        formMessage.textContent = "Please choose an interior option.";
        formMessage.classList.remove("hidden");
        return;
      }
    }

    const request = {
      project: projectSelect.value,
      elevation: elevationSelect.value,
      scope: scopeSelect.value,
      eta: "3d 6h remaining"
    };

    requests.push(request);
    renderRequests();

    formMessage.textContent = `Request submitted for ${request.project} • ${request.elevation} • ${request.scope}.`;
    formMessage.classList.remove("hidden");

    form.reset();
    projectSelect.selectedIndex = 0;
    scopeSelect.selectedIndex = 0;
    updateOptions();
    updateInteriorOptions();
  });
});

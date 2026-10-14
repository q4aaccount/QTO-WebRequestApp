document.addEventListener("DOMContentLoaded", () => {
  const projectSelect = document.getElementById("project-select");
  const elevationSelect = document.getElementById("elevation-select");
  const scopeSelect = document.getElementById("scope-select");
  const interiorOptionsWrapper = document.getElementById("interior-options-wrapper");
  const interiorOptions = document.getElementById("interior-options");
  const form = document.getElementById("request-form");
  const formMessage = document.getElementById("form-message");
  const list = document.getElementById("request-list");

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
    if (!list) return;

    list.innerHTML = requests
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

  if (projectSelect) {
    populateProjects();
    projectSelect.addEventListener("change", updateOptions);
  }

  if (scopeSelect) {
    scopeSelect.addEventListener("change", updateInteriorOptions);
  }

  renderRequests();
  updateOptions();
  updateInteriorOptions();

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

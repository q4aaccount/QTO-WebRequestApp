document.addEventListener("DOMContentLoaded", () => {
  const projectSelect = document.getElementById("project-select");
  const elevationSelect = document.getElementById("elevation-select");
  const stageSelect = document.getElementById("project-stage");
  const form = document.getElementById("request-form");
  const formMessage = document.getElementById("form-message");
  const list = document.getElementById("request-list");

  const projectData = {
    "North Tower": {
      elevations: ["Elevation A", "Elevation B", "Elevation C"],
      stages: ["Schematic Design", "Working Drawing", "Construction Documentation"]
    },
    "Harbor Residences": {
      elevations: ["Elevation 1", "Elevation 2"],
      stages: ["Planning", "Design Review", "Tender"]
    },
    "Riverfront Campus": {
      elevations: ["Classic", "Modern", "Premium"],
      stages: ["Feasibility", "Concept", "Build"]
    }
  };

  const requests = [
    { project: "North Tower", elevation: "Elevation B", stage: "Working Drawing" },
    { project: "Harbor Residences", elevation: "Elevation 1", stage: "Design Review" }
  ];

  const renderRequests = () => {
    if (!list) return;

    list.innerHTML = requests
      .slice()
      .reverse()
      .map(
        (request) => `
          <li>
            <div>
              <strong>${request.project}</strong>
              <div class="meta">${request.elevation} • ${request.stage}</div>
            </div>
            <span class="meta">Submitted</span>
          </li>
        `
      )
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

  const updateOptions = () => {
    const selectedProject = projectSelect.value;
    const selectedData = projectData[selectedProject];

    elevationSelect.innerHTML = '<option value="">Select an elevation style</option>';
    stageSelect.innerHTML = '<option value="">Select a stage</option>';

    if (!selectedData) return;

    selectedData.elevations.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      elevationSelect.appendChild(option);
    });

    selectedData.stages.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      stageSelect.appendChild(option);
    });
  };

  if (projectSelect) {
    populateProjects();
    projectSelect.addEventListener("change", updateOptions);
  }

  renderRequests();

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!projectSelect.value || !elevationSelect.value || !stageSelect.value) {
      formMessage.textContent = "Please select a project, elevation style, and project stage.";
      formMessage.classList.remove("hidden");
      return;
    }

    const request = {
      project: projectSelect.value,
      elevation: elevationSelect.value,
      stage: stageSelect.value
    };

    requests.push(request);
    renderRequests();

    formMessage.textContent = `Request submitted for ${request.project} • ${request.elevation} • ${request.stage}.`;
    formMessage.classList.remove("hidden");

    form.reset();
    projectSelect.selectedIndex = 0;
    updateOptions();
  });
});
"message":"Updated the app to a simple request form with project, elevation, and stage selections.
"}]}  
{
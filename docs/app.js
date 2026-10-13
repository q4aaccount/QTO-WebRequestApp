document.addEventListener("DOMContentLoaded", () => {
  const projectSelect = document.getElementById("project-select");
  const elevationSelect = document.getElementById("elevation-select");
  const stageSelect = document.getElementById("project-stage");
  const form = document.getElementById("request-form");
  const formMessage = document.getElementById("form-message");
  const list = document.getElementById("request-list");

  const stages = ["Submitted", "Received", "Work In Progress", "Completed"];

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
    {
      project: "North Tower",
      elevation: "Elevation B",
      stage: "Work In Progress",
      eta: "1d 4h remaining"
    },
    {
      project: "Harbor Residences",
      elevation: "Elevation 1",
      stage: "Received",
      eta: "2d 8h remaining"
    },
    {
      project: "Riverfront Campus",
      elevation: "Premium",
      stage: "Completed",
      eta: "0h remaining"
    }
  ];

  const getStageIndex = (stageName) => stages.indexOf(stageName);

  const renderRequests = () => {
    if (!list) return;

    list.innerHTML = requests
      .slice()
      .reverse()
      .map((request) => {
        const activeIndex = getStageIndex(request.stage);

        const steps = stages
          .map((step, index) => {
            const isDone = index < activeIndex;
            const isCurrent = index === activeIndex;
            const stateClass = isDone ? "done" : isCurrent ? "current" : "pending";

            return `
              <div class="process-step ${stateClass}">
                <span class="step-dot"></span>
                <span class="step-label">${step}</span>
              </div>
            `;
          })
          .join("");

        return `
          <li class="request-item">
            <div class="request-header">
              <div>
                <strong>${request.project}</strong>
                <div class="request-meta">${request.elevation}</div>
              </div>
              <span class="request-eta">ETA: ${request.eta}</span>
            </div>
            <div class="request-process" aria-label="Request process">
              ${steps}
            </div>
          </li>
        `;
      })
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
    if (!projectSelect || !elevationSelect || !stageSelect) return;

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
      stage: "Submitted",
      eta: "3d 6h remaining"
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

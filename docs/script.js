document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("request-form");
  const tableBody = document.getElementById("request-table-body");

  if (form && tableBody) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("request-name").value.trim();
      const category = document.getElementById("request-category").value;
      const priority = document.getElementById("request-priority").value;
      const details = document.getElementById("request-details").value.trim();

      if (!name) return;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${name}</td>
        <td>${category}</td>
        <td><span class="status-tag ${priority === "Critical" ? "in-progress" : "review"}">${priority}</span></td>
      `;

      tableBody.prepend(row);

      const toast = document.createElement("div");
      toast.textContent = `Request "${name}" submitted successfully.`;
      toast.style.position = "fixed";
      toast.style.right = "24px";
      toast.style.bottom = "24px";
      toast.style.background = "#111827";
      toast.style.color = "white";
      toast.style.padding = "12px 16px";
      toast.style.borderRadius = "12px";
      toast.style.boxShadow = "0 12px 30px rgba(15, 23, 42, 0.2)";
      toast.style.zIndex = "1000";
      document.body.appendChild(toast);

      setTimeout(() => toast.remove(), 2500);
      form.reset();
    });
  }
});

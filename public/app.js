* {
  box-sizing: border-box;
}

:root {
  --bg: #eef4ff;
  --panel: #ffffff;
  --panel-alt: #f4f7ff;
  --sidebar: #0f172a;
  --sidebar-soft: #172338;
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --dark: #111827;
  --text: #122033;
  --muted: #5f7288;
  --line: #dfeaf7;
  --green: #0d9f6e;
  --green-soft: #ebfff6;
  --blue: #1d4ed8;
  --blue-soft: #edf3ff;
  --purple: #7c3aed;
  --purple-soft: #f1eafe;
  --orange: #d97706;
  --orange-soft: #fff4db;
  --danger: #dc2626;
  --danger-soft: #fdecec;
  --shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: linear-gradient(180deg, #eff6ff 0%, #f7f9fb 100%);
  color: var(--text);
}

button,
input,
select,
textarea {
  font: inherit;
}

.hidden {
  display: none !important;
}

.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card {
  width: min(100%, 460px);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 28px;
  box-shadow: var(--shadow);
}

.auth-badge {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 18px;
}

.auth-card h1 {
  margin: 0;
  font-size: 2rem;
}

.auth-subtitle {
  color: var(--muted);
  margin: 8px 0 18px;
}

.info-box {
  font-size: 0.94rem;
  color: var(--text);
  background: var(--panel-alt);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 18px;
}

#login-form,
#request-form,
.inline-form {
  display: grid;
  gap: 14px;
}

label {
  display: grid;
  gap: 8px;
  color: var(--text);
  font-weight: 600;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #f9fbff;
  color: var(--text);
  padding: 0.82rem 0.9rem;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.55);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.11);
}

.primary-btn,
.secondary-btn,
.nav-btn,
.status-pill,
.download-btn {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.primary-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 0.85rem 1rem;
  font-weight: 700;
}

.primary-btn:hover,
.secondary-btn:hover,
.nav-btn:hover,
.download-btn:hover {
  transform: translateY(-1px);
}

.secondary-btn {
  background: #ebf2ff;
  color: var(--primary-dark);
  padding: 0.8rem 1rem;
  font-weight: 700;
}

.full-width {
  width: 100%;
}

.app-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, var(--sidebar) 0%, var(--sidebar-soft) 100%);
  color: white;
  padding: 26px 18px;
}

.brand-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6aa6ff, #2563eb);
  display: grid;
  place-items: center;
  font-weight: bold;
  font-size: 1.3rem;
}

.brand-box small {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-box h2 {
  margin: 2px 0 0;
  font-size: 1.6rem;
}

.nav {
  display: grid;
  gap: 10px;
}

.nav-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 14px;
  text-align: left;
}

.nav-btn.active {
  background: rgba(148, 163, 184, 0.12);
  color: white;
}

.main-panel {
  padding: 26px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
}

.topbar h3 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.68rem;
  color: var(--muted);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-pill,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.42rem 0.8rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.role-pill {
  background: var(--blue-soft);
  color: var(--blue);
}

.status-badge.green {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.blue {
  background: var(--blue-soft);
  color: var(--blue);
}

.status-badge.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.status-badge.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.view {
  display: block;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 22px;
  box-shadow: var(--shadow);
  margin-bottom: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.panel-header h4 {
  margin: 0;
  font-size: 1.15rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.message {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.95rem;
}

.message.error {
  background: var(--danger-soft);
  color: var(--danger);
}

.message.success {
  background: var(--green-soft);
  color: var(--green);
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

th,
td {
  text-align: left;
  padding: 12px 10px;
  border-bottom: 1px solid var(--line);
}

th {
  color: var(--muted);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.inline-form {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
}

.project-list,
.user-list,
.admin-request-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.project-card,
.user-card,
.request-card {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px;
  background: var(--panel-alt);
}

.project-card-header,
.user-card-header,
.request-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.project-card h5,
.user-card h5,
.request-card h5 {
  margin: 0;
  font-size: 1rem;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #edf3ff;
  color: var(--blue);
  padding: 0.34rem 0.62rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  padding-top: 10px;
}

.checkbox-label input {
  width: auto;
  margin: 0;
}

.small-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.8rem;
  background: var(--purple-soft);
  color: var(--purple);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.request-card .meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.select-status {
  width: auto;
  min-width: 140px;
}

.download-btn {
  background: var(--green-soft);
  color: var(--green);
  padding: 0.46rem 0.7rem;
  font-weight: 700;
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding-bottom: 10px;
  }

  .inline-form {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .main-panel {
    padding: 18px 14px 24px;
  }

  .grid-2,
  .inline-form {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}

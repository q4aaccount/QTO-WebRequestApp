const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const STORAGE_DIR = path.join(ROOT_DIR, "storage");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(STORAGE_DIR, { recursive: true });

const db = new sqlite3.Database(path.join(DATA_DIR, "qto.db"));

const uuid = () => crypto.randomUUID();

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_active INTEGER NOT NULL DEFAULT 1,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS project_elevations (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS project_stages (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      request_no TEXT UNIQUE NOT NULL,
      project_id TEXT NOT NULL,
      elevation_id TEXT NOT NULL,
      stage_id TEXT NOT NULL,
      requested_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (elevation_id) REFERENCES project_elevations(id),
      FOREIGN KEY (stage_id) REFERENCES project_stages(id),
      FOREIGN KEY (requested_by) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS request_files (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  const existingAdmin = await get("SELECT id FROM users WHERE email = ?", ["admin@qto.local"]);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Admin123!", 10);
    await run(
      "INSERT INTO users (id, email, name, role, is_active, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
      [uuid(), "admin@qto.local", "Administrator", "admin", 1, passwordHash]
    );
  }

  const projectCount = await get("SELECT COUNT(*) as total FROM projects");
  if (!projectCount || Number(projectCount.total) === 0) {
    const projects = [
      { id: uuid(), name: "North Tower", code: "NTR-01" },
      { id: uuid(), name: "Harbor Residences", code: "HR-22" }
    ];

    for (const project of projects) {
      await run("INSERT INTO projects (id, name, code, is_active) VALUES (?, ?, ?, 1)", [project.id, project.name, project.code]);

      const elevationNames = project.name === "North Tower" ? ["Elevation A", "Elevation B", "Elevation C"] : ["Elevation A", "Elevation B"];
      const stageNames = project.name === "North Tower" ? ["Schematic Design", "Working Drawing", "Construction Documentation"] : ["Schematic Design", "Working Drawing"];

      for (const name of elevationNames) {
        await run("INSERT INTO project_elevations (id, project_id, name) VALUES (?, ?, ?)", [uuid(), project.id, name]);
      }

      for (const name of stageNames) {
        await run("INSERT INTO project_stages (id, project_id, name) VALUES (?, ?, ?)", [uuid(), project.id, name]);
      }
    }
  }
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "qto-request-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 12,
      sameSite: "lax"
    }
  })
);

app.use(express.static(path.join(ROOT_DIR, "public")));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const requestId = req.params.id;
      const folder = path.join(STORAGE_DIR, requestId);
      fs.mkdirSync(folder, { recursive: true });
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    }
  })
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.session.user });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await get("SELECT * FROM users WHERE email = ?", [String(email).trim().toLowerCase()]);
  if (!user || user.is_active !== 1) {
    return res.status(401).json({ error: "Invalid user or inactive account." });
  }

  const passwordMatches = await bcrypt.compare(String(password), user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  return res.json({ user: req.session.user, message: "Login successful" });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get("/api/projects", requireAuth, async (req, res) => {
  try {
    const projects = await all("SELECT * FROM projects WHERE is_active = 1 ORDER BY name ASC");

    for (const project of projects) {
      project.elevations = await all("SELECT * FROM project_elevations WHERE project_id = ? ORDER BY name ASC", [project.id]);
      project.stages = await all("SELECT * FROM project_stages WHERE project_id = ? ORDER BY name ASC", [project.id]);
    }

    res.json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load projects." });
  }
});

app.post("/api/requests", requireAuth, async (req, res) => {
  const { project_id, elevation_id, stage_id, notes } = req.body;

  if (!project_id || !elevation_id || !stage_id) {
    return res.status(400).json({ error: "Project, elevation and stage are required." });
  }

  const project = await get("SELECT * FROM projects WHERE id = ? AND is_active = 1", [project_id]);
  if (!project) {
    return res.status(404).json({ error: "Project not found." });
  }

  const elevation = await get("SELECT * FROM project_elevations WHERE id = ? AND project_id = ?", [elevation_id, project_id]);
  const stage = await get("SELECT * FROM project_stages WHERE id = ? AND project_id = ?", [stage_id, project_id]);

  if (!elevation || !stage) {
    return res.status(400).json({ error: "Selected elevation or stage is not valid for this project." });
  }

  const requestId = uuid();
  const requestNo = `QTO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 900 + 100))}`;
  const now = new Date().toISOString();

  await run(
    `INSERT INTO requests (id, request_no, project_id, elevation_id, stage_id, requested_by, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?)`,
    [requestId, requestNo, project_id, elevation_id, stage_id, req.session.user.id, notes || "", now, now]
  );

  res.status(201).json({
    message: "Request submitted successfully.",
    request: {
      id: requestId,
      request_no: requestNo,
      status: "submitted"
    }
  });
});

app.get("/api/requests", requireAuth, async (req, res) => {
  try {
    let query = `
      SELECT r.*, p.name AS project_name, e.name AS elevation_name, s.name AS stage_name,
             u.name AS requested_by_name,
             (SELECT COUNT(*) FROM request_files rf WHERE rf.request_id = r.id) AS file_count
      FROM requests r
      LEFT JOIN projects p ON p.id = r.project_id
      LEFT JOIN project_elevations e ON e.id = r.elevation_id
      LEFT JOIN project_stages s ON s.id = r.stage_id
      LEFT JOIN users u ON u.id = r.requested_by
    `;

    const params = [];

    if (req.session.user.role !== "admin") {
      query += " WHERE r.requested_by = ?";
      params.push(req.session.user.id);
    }

    query += " ORDER BY r.created_at DESC";

    const rows = await all(query, params);

    const requests = rows.map((row) => ({
      id: row.id,
      request_no: row.request_no,
      project_name: row.project_name,
      elevation_name: row.elevation_name,
      stage_name: row.stage_name,
      requested_by_name: row.requested_by_name,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      file_count: Number(row.file_count || 0),
      download_url: Number(row.file_count || 0) > 0 ? `/api/requests/${row.id}/files` : null
    }));

    res.json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load request history." });
  }
});

app.get("/api/requests/:id/files", requireAuth, async (req, res) => {
  const requestId = req.params.id;
  const request = await get("SELECT * FROM requests WHERE id = ?", [requestId]);

  if (!request) {
    return res.status(404).json({ error: "Request not found." });
  }

  if (req.session.user.role !== "admin" && request.requested_by !== req.session.user.id) {
    return res.status(403).json({ error: "You cannot access these files." });
  }

  const files = await all("SELECT * FROM request_files WHERE request_id = ? ORDER BY uploaded_at DESC", [requestId]);
  const formatted = files.map((file) => ({
    id: file.id,
    file_name: file.file_name,
    file_path: file.file_path,
    download_url: `/api/download/${file.id}`
  }));

  res.json({ files: formatted });
});

app.get("/api/download/:fileId", requireAuth, async (req, res) => {
  const fileRecord = await get("SELECT * FROM request_files WHERE id = ?", [req.params.fileId]);

  if (!fileRecord) {
    return res.status(404).json({ error: "File not found." });
  }

  const request = await get("SELECT * FROM requests WHERE id = ?", [fileRecord.request_id]);
  if (!request) {
    return res.status(404).json({ error: "Request not found." });
  }

  if (req.session.user.role !== "admin" && request.requested_by !== req.session.user.id) {
    return res.status(403).json({ error: "No access to this file." });
  }

  res.download(fileRecord.file_path, fileRecord.file_name);
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const users = await all("SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC");
  res.json({ users });
});

app.post("/api/admin/users", requireAdmin, async (req, res) => {
  const { email, name, role, is_active, password } = req.body;

  if (!email || !name || !role) {
    return res.status(400).json({ error: "Name, email and role are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await get("SELECT id FROM users WHERE email = ?", [normalizedEmail]);

  if (existing) {
    const updates = [
      "UPDATE users SET name = ?, role = ?, is_active = ?",
      [name, role, Number(is_active) ? 1 : 0]
    ];

    if (password && String(password).trim()) {
      const hash = await bcrypt.hash(String(password), 10);
      updates[0] += ", password_hash = ?";
      updates[1].push(hash);
    }

    updates[0] += " WHERE email = ?";
    updates[1].push(normalizedEmail);

    await run(updates[0], updates[1]);

    const updated = await get("SELECT id, email, name, role, is_active FROM users WHERE email = ?", [normalizedEmail]);
    return res.json({ message: "User updated successfully.", user: updated });
  }

  const hash = await bcrypt.hash(String(password || "Welcome123!"), 10);
  const userId = uuid();
  await run(
    "INSERT INTO users (id, email, name, role, is_active, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, normalizedEmail, name, role, Number(is_active) ? 1 : 0, hash]
  );

  const created = await get("SELECT id, email, name, role, is_active FROM users WHERE id = ?", [userId]);
  res.status(201).json({ message: "User created successfully.", user: created });
});

app.post("/api/admin/projects", requireAdmin, async (req, res) => {
  const { id, name, code, is_active } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Project name is required." });
  }

  if (id) {
    await run("UPDATE projects SET name = ?, code = ?, is_active = ? WHERE id = ?", [name.trim(), code || "", Number(is_active) ? 1 : 0, id]);
    const updated = await get("SELECT * FROM projects WHERE id = ?", [id]);
    return res.json({ message: "Project updated successfully.", project: updated });
  }

  const projectId = uuid();
  await run("INSERT INTO projects (id, name, code, is_active) VALUES (?, ?, ?, ?)", [projectId, name.trim(), code || "", Number(is_active) ? 1 : 0]);
  const project = await get("SELECT * FROM projects WHERE id = ?", [projectId]);
  res.status(201).json({ message: "Project created successfully.", project });
});

app.post("/api/admin/projects/:id/elevations", requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Elevation name is required." });
  }

  const project = await get("SELECT * FROM projects WHERE id = ?", [req.params.id]);
  if (!project) {
    return res.status(404).json({ error: "Project not found." });
  }

  const elevationId = uuid();
  await run("INSERT INTO project_elevations (id, project_id, name) VALUES (?, ?, ?)", [elevationId, req.params.id, name.trim()]);
  const elevation = await get("SELECT * FROM project_elevations WHERE id = ?", [elevationId]);
  res.status(201).json({ message: "Elevation added successfully.", elevation });
});

app.post("/api/admin/projects/:id/stages", requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Stage name is required." });
  }

  const project = await get("SELECT * FROM projects WHERE id = ?", [req.params.id]);
  if (!project) {
    return res.status(404).json({ error: "Project not found." });
  }

  const stageId = uuid();
  await run("INSERT INTO project_stages (id, project_id, name) VALUES (?, ?, ?)", [stageId, req.params.id, name.trim()]);
  const stage = await get("SELECT * FROM project_stages WHERE id = ?", [stageId]);
  res.status(201).json({ message: "Stage added successfully.", stage });
});

app.get("/api/admin/requests", requireAdmin, async (req, res) => {
  const requests = await all(`
    SELECT r.*, p.name AS project_name, e.name AS elevation_name, s.name AS stage_name,
           u.name AS requested_by_name,
           (SELECT COUNT(*) FROM request_files rf WHERE rf.request_id = r.id) AS file_count
    FROM requests r
    LEFT JOIN projects p ON p.id = r.project_id
    LEFT JOIN project_elevations e ON e.id = r.elevation_id
    LEFT JOIN project_stages s ON s.id = r.stage_id
    LEFT JOIN users u ON u.id = r.requested_by
    ORDER BY r.created_at DESC
  `);

  res.json({ requests });
});

app.patch("/api/admin/requests/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  const request = await get("SELECT * FROM requests WHERE id = ?", [req.params.id]);
  if (!request) {
    return res.status(404).json({ error: "Request not found." });
  }

  await run("UPDATE requests SET status = ?, updated_at = ? WHERE id = ?", [status, new Date().toISOString(), req.params.id]);

  const updated = await get("SELECT * FROM requests WHERE id = ?", [req.params.id]);
  res.json({ message: "Request status updated.", request: updated });
});

app.post("/api/admin/requests/:id/files", requireAdmin, upload.array("files", 10), async (req, res) => {
  const request = await get("SELECT * FROM requests WHERE id = ?", [req.params.id]);
  if (!request) {
    return res.status(404).json({ error: "Request not found." });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one file is required." });
  }

  for (const file of req.files) {
    const fileId = uuid();
    await run(
      "INSERT INTO request_files (id, request_id, file_name, file_path, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)",
      [fileId, req.params.id, file.originalname, path.join(file.destination, file.filename), req.session.user.id, new Date().toISOString()]
    );
  }

  await run("UPDATE requests SET status = ?, updated_at = ? WHERE id = ?", ["completed", new Date().toISOString(), req.params.id]);

  res.json({ message: "Files uploaded and request marked as completed." });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "public", "index.html"));
});

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`QTO app running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// storage.js
//
// Pluggable persistence for Tiny Tasks API.
// Select via env STORAGE=memory|json|sqlite
// - memory (default): in-process Map
// - json: JSON file at TASKS_JSON_PATH (default: ./data/tasks.json)
// - sqlite: SQLite file at TASKS_SQLITE_PATH (default: ./data/tasks.db), requires better-sqlite3

const fs = require('fs');
const path = require('path');

function makeId() {
  // Simple id: timestamp + random suffix to avoid rare collisions
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
}

/* --------------------- Memory --------------------- */
class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  list() {
    return Array.from(this.map.values());
  }
  get(id) {
    return this.map.get(id) || null;
  }
  create({ title, due, completed }) {
    const id = makeId();
    const task = { id, title, due, completed: !!completed };
    this.map.set(id, task);
    return task;
  }
  update(id, patch) {
    const cur = this.map.get(id);
    if (!cur) return null;
    const updated = { ...cur, ...patch };
    this.map.set(id, updated);
    return updated;
  }
  delete(id) {
    return this.map.delete(id);
  }
}

/* --------------------- JSON File --------------------- */
class JsonStorage {
  constructor(filePath) {
    this.filePath = filePath;
    this.dir = path.dirname(filePath);
    fs.mkdirSync(this.dir, { recursive: true });
    this.map = new Map();
    this._load();
  }
  _load() {
    if (!fs.existsSync(this.filePath)) {
      return;
    }
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const arr = raw ? JSON.parse(raw) : [];
      for (const t of arr) this.map.set(t.id, t);
    } catch {
      // Corrupt or unreadable file; start empty (safer default)
      this.map = new Map();
    }
  }
  _persist() {
    const arr = Array.from(this.map.values());
    const tmp = this.filePath + '.tmp';
    const buf = Buffer.from(JSON.stringify(arr), 'utf8');
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, this.filePath);
  }
  list() {
    return Array.from(this.map.values());
  }
  get(id) {
    return this.map.get(id) || null;
  }
  create({ title, due, completed }) {
    const id = makeId();
    const task = { id, title, due, completed: !!completed };
    this.map.set(id, task);
    this._persist();
    return task;
  }
  update(id, patch) {
    const cur = this.map.get(id);
    if (!cur) return null;
    const updated = { ...cur, ...patch };
    this.map.set(id, updated);
    this._persist();
    return updated;
  }
  delete(id) {
    const existed = this.map.delete(id);
    if (existed) this._persist();
    return existed;
  }
}

/* --------------------- SQLite --------------------- */
class SqliteStorage {
  constructor(filePath) {
    let BetterSqlite3;
    try {
      BetterSqlite3 = require('better-sqlite3');
    } catch {
      throw new Error(
        'SQLite storage selected, but "better-sqlite3" is not installed. Install with: npm i better-sqlite3'
      );
    }
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    this.db = new BetterSqlite3(filePath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 2000');

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          due TEXT NOT NULL,
          completed INTEGER NOT NULL
        )`
      )
      .run();

    this.stmts = {
      list: this.db.prepare('SELECT id, title, due, completed FROM tasks'),
      get: this.db.prepare('SELECT id, title, due, completed FROM tasks WHERE id = ?'),
      insert: this.db.prepare(
        'INSERT INTO tasks (id, title, due, completed) VALUES (?, ?, ?, ?)'
      ),
      update: this.db.prepare(
        `UPDATE tasks SET
           title = COALESCE(?, title),
           due = COALESCE(?, due),
           completed = COALESCE(?, completed)
         WHERE id = ?`
      ),
      delete: this.db.prepare('DELETE FROM tasks WHERE id = ?'),
    };
  }
  list() {
    const rows = this.stmts.list.all();
    return rows.map((r) => ({ id: r.id, title: r.title, due: r.due, completed: !!r.completed }));
  }
  get(id) {
    const r = this.stmts.get.get(id);
    return r ? { id: r.id, title: r.title, due: r.due, completed: !!r.completed } : null;
  }
  create({ title, due, completed }) {
    const id = makeId();
    this.stmts.insert.run(id, title, due, completed ? 1 : 0);
    return { id, title, due, completed: !!completed };
  }
  update(id, patch) {
    const cur = this.get(id);
    if (!cur) return null;
    const title = Object.prototype.hasOwnProperty.call(patch, 'title') ? patch.title : null;
    const due = Object.prototype.hasOwnProperty.call(patch, 'due') ? patch.due : null;
    const completed = Object.prototype.hasOwnProperty.call(patch, 'completed')
      ? patch.completed ? 1 : 0
      : null;
    this.stmts.update.run(title, due, completed, id);
    return this.get(id);
  }
  delete(id) {
    const info = this.stmts.delete.run(id);
    return info.changes > 0;
  }
}

/* --------------------- Factory --------------------- */
function createStorage({ driver = 'memory', jsonPath, sqlitePath }) {
  const d = String(driver || 'memory').toLowerCase();
  if (d === 'memory') return new MemoryStorage();
  if (d === 'json') {
    const file = jsonPath || path.resolve(process.cwd(), 'data', 'tasks.json');
    return new JsonStorage(file);
  }
  if (d === 'sqlite') {
    const file = sqlitePath || path.resolve(process.cwd(), 'data', 'tasks.db');
    return new SqliteStorage(file);
  }
  // Fallback to memory with a warning
  console.warn(`Unknown STORAGE="${driver}", falling back to memory`);
  return new MemoryStorage();
}

module.exports = { createStorage };


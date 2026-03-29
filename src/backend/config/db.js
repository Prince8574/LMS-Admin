'use strict';

/**
 * config/db.js — Admin Panel
 * ─────────────────────────────────────────────────────────────────────────────
 * Advanced MongoDB connection manager using the native driver (mongodb).
 *
 * Features:
 *  • Colored, timestamped console output
 *  • Singleton client guard
 *  • Auto-retry with exponential back-off + human-readable error diagnosis
 *  • Connection pool tuning
 *  • Ping latency + collection stats on startup
 *  • Graceful shutdown on SIGINT / SIGTERM (registered once)
 *  • dbStatus() for /api/health endpoint
 *  • Credentials always masked in logs
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// ── ANSI Colors ───────────────────────────────────────────────────────────────
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  cyan:    '\x1b[36m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
};

// ── Logger ────────────────────────────────────────────────────────────────────
const ts    = () => new Date().toLocaleTimeString('en-IN', { hour12: false });
const tag   = (color, label) => `${color}${C.bold}[DB ${label}]${C.reset}`;
const stamp = (color, label) => `${C.dim}${ts()}${C.reset} ${tag(color, label)}`;

const log = {
  info  : (...m) => console.log  (stamp(C.cyan,    'INFO '), ...m),
  ok    : (...m) => console.log  (stamp(C.green,   'OK   '), ...m),
  warn  : (...m) => console.warn (stamp(C.yellow,  'WARN '), ...m),
  error : (...m) => console.error(stamp(C.red,     'ERROR'), ...m),
  event : (...m) => console.log  (stamp(C.magenta, 'EVENT'), ...m),
  stat  : (...m) => console.log  (stamp(C.blue,    'STAT '), ...m),
};

// ── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learnverse';
const DB_NAME   = process.env.DB_NAME   || 'learnverse';

const MAX_RETRIES    = 3;
const RETRY_DELAY_MS = 3000;

// ── State ─────────────────────────────────────────────────────────────────────
let client = null;
let db     = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
const maskedURI = () => MONGO_URI.replace(/:([^@]+)@/, ':****@');
const sleep     = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Translates raw MongoDB error messages into actionable advice.
 */
const diagnose = (err) => {
  const msg = err.message || '';

  if (msg.includes('ECONNREFUSED'))
    return 'MongoDB is not running or the host/port is wrong. Check your MONGO_URI.';
  if (msg.includes('Authentication failed') || msg.includes('bad auth'))
    return 'Wrong username or password in MONGO_URI. Check your Atlas credentials.';
  if (msg.includes('IP') || msg.includes('whitelist') || msg.includes('not allowed'))
    return 'Your IP is not whitelisted in MongoDB Atlas. Add it under Network Access.';
  if (msg.includes('ETIMEOUT') || msg.includes('timed out') || msg.includes('Server selection'))
    return 'Connection timed out. Check your internet connection or Atlas cluster status.';
  if (msg.includes('SSL') || msg.includes('TLS'))
    return 'SSL/TLS error. Make sure you are using the correct Atlas connection string.';
  if (msg.includes('ENOTFOUND'))
    return 'DNS lookup failed. Check the hostname in your MONGO_URI.';

  return 'Unknown error — check the full message above for details.';
};

// ── Connect ───────────────────────────────────────────────────────────────────
/**
 * Opens a MongoClient connection with auto-retry.
 * Returns cached db instance if already connected.
 *
 * @returns {Promise<import('mongodb').Db>}
 */
const connectDB = async () => {
  if (db) {
    log.info('Already connected — skipping.');
    return db;
  }

  log.info(`Connecting to: ${C.cyan}${maskedURI()}${C.reset}`);
  log.info(`Database     : ${C.bold}${DB_NAME}${C.reset}`);
  log.info(`Environment  : ${C.bold}${process.env.NODE_ENV || 'development'}${C.reset}`);

  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const t0 = Date.now();

      client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS : 8000,
        socketTimeoutMS          : 45000,
        maxPoolSize              : 10,
        minPoolSize              : 2,
        retryWrites              : true,
        retryReads               : true,
      });

      await client.connect();
      db = client.db(DB_NAME);

      // Verify with ping
      await db.command({ ping: 1 });
      const pingMs = Date.now() - t0;

      log.ok(`${C.green}${C.bold}MongoDB ready${C.reset}`);
      log.stat(`Database : ${C.cyan}${DB_NAME}${C.reset}`);
      log.stat(`Latency  : ${pingMs < 80 ? C.green : C.yellow}${pingMs}ms${C.reset}`);

      // Collection stats
      try {
        const cols = await db.listCollections().toArray();
        log.stat(`Collections (${cols.length}): ${C.dim}${cols.map(c => c.name).join(', ')}${C.reset}`);
      } catch (_) {}

      log.ok(`${C.dim}─────────────────────────────────────────${C.reset}`);
      return db;

    } catch (err) {
      attempt++;

      // Clean up failed client
      try { await client?.close(); } catch (_) {}
      client = null;
      db     = null;

      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);

      log.error(`${C.red}${C.bold}Connection failed (attempt ${attempt}/${MAX_RETRIES})${C.reset}`);
      log.error(`Reason  : ${C.red}${err.message}${C.reset}`);
      log.error(`Fix     : ${C.yellow}${diagnose(err)}${C.reset}`);

      if (attempt >= MAX_RETRIES) {
        log.error(`${C.red}${C.bold}All ${MAX_RETRIES} attempts exhausted. Exiting.${C.reset}`);
        log.error(`${C.dim}URI tried: ${maskedURI()}${C.reset}`);
        process.exit(1);
      }

      log.warn(`Retrying in ${C.bold}${delay / 1000}s${C.reset}... (${MAX_RETRIES - attempt} attempt(s) left)`);
      await sleep(delay);
    }
  }
};

// ── Get DB ────────────────────────────────────────────────────────────────────
/**
 * Returns the active Db instance.
 * Throws a clear error if called before connectDB().
 *
 * @returns {import('mongodb').Db}
 */
const getDB = () => {
  if (!db) {
    log.error('getDB() called before connectDB(). Call connectDB() first in server.js.');
    throw new Error('[DB] Not connected. Call connectDB() before getDB().');
  }
  return db;
};

// ── Disconnect ────────────────────────────────────────────────────────────────
const disconnectDB = async () => {
  if (!client) return;
  await client.close();
  client = null;
  db     = null;
  log.info('Connection closed cleanly.');
};

// ── Health ────────────────────────────────────────────────────────────────────
const dbStatus = () => (db ? 'connected' : 'disconnected');

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('');
  log.warn(`${C.yellow}${C.bold}${signal} received — shutting down gracefully...${C.reset}`);
  await disconnectDB();
  log.ok('Shutdown complete. Goodbye 👋');
  process.exit(0);
};

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { connectDB, getDB, disconnectDB, dbStatus, maskedURI };

const { getDB } = require('../config/db');

const COLLECTION = 'health_checks';

// Save a health check entry
async function saveCheck({ service, ok, latency, message }) {
  const db = getDB();
  return db.collection(COLLECTION).insertOne({
    service,
    ok,
    latency: latency || null,
    message: message || null,
    checkedAt: new Date(),
  });
}

// Get last N days of checks per service
async function getHistory(service, days = 90) {
  const db = getDB();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db.collection(COLLECTION)
    .find({ service, checkedAt: { $gte: since } })
    .sort({ checkedAt: 1 })
    .toArray();
}

// Get latest check per service
async function getLatest(service) {
  const db = getDB();
  return db.collection(COLLECTION)
    .findOne({ service }, { sort: { checkedAt: -1 } });
}

// Get all services summary
async function getAllServicesSummary(days = 90) {
  const db = getDB();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const pipeline = [
    { $match: { checkedAt: { $gte: since } } },
    {
      $group: {
        _id: '$service',
        total: { $sum: 1 },
        ok: { $sum: { $cond: ['$ok', 1, 0] } },
        avgLatency: { $avg: '$latency' },
        lastCheck: { $max: '$checkedAt' },
        lastOk: { $last: '$ok' },
        lastMessage: { $last: '$message' },
      }
    }
  ];
  return db.collection(COLLECTION).aggregate(pipeline).toArray();
}

// Get daily aggregated history for bar chart (last N days)
async function getDailyHistory(service, days = 90) {
  const db = getDB();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const pipeline = [
    { $match: { service, checkedAt: { $gte: since } } },
    {
      $group: {
        _id: {
          year: { $year: '$checkedAt' },
          month: { $month: '$checkedAt' },
          day: { $dayOfMonth: '$checkedAt' },
        },
        total: { $sum: 1 },
        ok: { $sum: { $cond: ['$ok', 1, 0] } },
        avgLatency: { $avg: '$latency' },
        date: { $first: '$checkedAt' },
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ];
  return db.collection(COLLECTION).aggregate(pipeline).toArray();
}

module.exports = { saveCheck, getHistory, getLatest, getAllServicesSummary, getDailyHistory };

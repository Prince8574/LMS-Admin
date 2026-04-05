const express = require('express');
const { getAllServicesSummary, getDailyHistory } = require('../models/HealthCheck');

const router = express.Router();

// GET /api/status — all services with daily history
router.get('/', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const summary = await getAllServicesSummary(days);

    // Attach daily history to each service
    const data = await Promise.all(summary.map(async (svc) => {
      const daily = await getDailyHistory(svc._id, days);
      return {
        service:       svc._id,
        currentStatus: svc.lastOk ? 'ok' : 'fail',
        latency:       svc.avgLatency ? Math.round(svc.avgLatency) : null,
        uptime90d:     svc.total > 0 ? Math.round((svc.ok / svc.total) * 100) : null,
        message:       svc.lastMessage,
        lastCheck:     svc.lastCheck,
        dailyHistory:  daily.map(d => ({
          date:   `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`,
          uptime: d.total > 0 ? Math.round((d.ok / d.total) * 100) : 0,
          total:  d.total,
          ok:     d.ok,
        })),
      };
    }));

    res.json({ success: true, data, days });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/status-breakdown', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching status breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/top-skills', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT skill_name, COUNT(*) as count
      FROM skills
      GROUP BY skill_name
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.get('/timeline', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        DATE_TRUNC('week', date_applied) as week,
        COUNT(*) as count
      FROM applications
      GROUP BY week
      ORDER BY week DESC
      LIMIT 12
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, 
             COUNT(DISTINCT i.id) as interview_count,
             COUNT(DISTINCT s.id) as skills_count
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      LEFT JOIN skills s ON a.id = s.application_id
      GROUP BY a.id
      ORDER BY a.date_applied DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appResult = await db.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const interviewsResult = await db.query(
      'SELECT * FROM interviews WHERE application_id = $1 ORDER BY interview_date',
      [id]
    );

    const skillsResult = await db.query(
      'SELECT * FROM skills WHERE application_id = $1',
      [id]
    );

    res.json({
      ...appResult.rows[0],
      interviews: interviewsResult.rows,
      skills: skillsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      company_name,
      position_title,
      job_url,
      date_applied,
      status,
      salary_min,
      salary_max,
      location,
      job_description,
      notes,
    } = req.body;

    if (!company_name || !position_title || !date_applied) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(
      `INSERT INTO applications (company_name, position_title, job_url, date_applied, status, salary_min, salary_max, location, job_description, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        company_name,
        position_title,
        job_url,
        date_applied,
        status || 'applied',
        salary_min,
        salary_max,
        location,
        job_description,
        notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      position_title,
      job_url,
      date_applied,
      status,
      salary_min,
      salary_max,
      location,
      job_description,
      notes,
    } = req.body;

    const result = await db.query(
      `UPDATE applications 
       SET company_name = $1, position_title = $2, job_url = $3, date_applied = $4, 
           status = $5, salary_min = $6, salary_max = $7, location = $8, 
           job_description = $9, notes = $10
       WHERE id = $11
       RETURNING *`,
      [
        company_name,
        position_title,
        job_url,
        date_applied,
        status,
        salary_min,
        salary_max,
        location,
        job_description,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM applications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const {
      application_id,
      interview_date,
      round_type,
      interviewer_name,
      questions_asked,
      my_answers,
      outcome,
      notes,
    } = req.body;

    if (!application_id) {
      return res.status(400).json({ error: 'application_id required' });
    }

    const result = await db.query(
      `INSERT INTO interviews (application_id, interview_date, round_type, interviewer_name, questions_asked, my_answers, outcome, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        application_id,
        interview_date,
        round_type,
        interviewer_name,
        questions_asked,
        my_answers,
        outcome,
        notes,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

router.post('/skills', async (req, res) => {
  try {
    const { application_id, skill_name, skill_type } = req.body;

    if (!application_id || !skill_name) {
      return res
        .status(400)
        .json({ error: 'application_id and skill_name required' });
    }

    const result = await db.query(
      `INSERT INTO skills (application_id, skill_name, skill_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [application_id, skill_name, skill_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

module.exports = router;

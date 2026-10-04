const express = require('express');
const pool = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/todos
router.get('/', async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    let query = 'SELECT * FROM todos WHERE user_id = $1';
    const params = [req.user.id];
    let idx = 2;

    if (status) { query += ` AND status = $${idx++}`; params.push(status); }
    if (priority) { query += ` AND priority = $${idx++}`; params.push(priority); }
    if (search) {
      query += ` AND (title ILIKE $${idx} OR description ILIKE $${idx + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      idx += 2;
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ todos: result.rows });
  } catch (err) {
    console.error('Get todos error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/todos
router.post('/', async (req, res) => {
  const { title, description, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required.' });

  try {
    const result = await pool.query(
      `INSERT INTO todos (user_id, title, description, priority, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, title, description || null, priority || 'medium', due_date || null]
    );
    res.status(201).json({ message: 'Todo created.', todo: result.rows[0] });
  } catch (err) {
    console.error('Create todo error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/todos/export/csv — HARUS sebelum /:id
router.get('/export/csv', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    const todos = result.rows;

    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created At', 'Updated At'];
    const csvRows = [
      headers.join(','),
      ...todos.map(t => [
        t.id,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.due_date ? t.due_date.toISOString().slice(0, 10) : '',
        t.created_at.toISOString(),
        t.updated_at.toISOString()
      ].join(','))
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="todos.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/todos/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Todo not found.' });
    res.json({ todo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/todos/:id
router.put('/:id', async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  try {
    const existing = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ message: 'Todo not found.' });

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE todos
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        title ?? current.title,
        description ?? current.description,
        status ?? current.status,
        priority ?? current.priority,
        due_date ?? current.due_date,
        req.params.id,
        req.user.id
      ]
    );
    res.json({ message: 'Todo updated.', todo: result.rows[0] });
  } catch (err) {
    console.error('Update todo error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Todo not found.' });
    res.json({ message: 'Todo deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;

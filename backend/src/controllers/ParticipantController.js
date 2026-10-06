import db from '../config/db.js';
import { z } from '../middleware/validate.js';

export const participantSchema = z.object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().max(40).nullable().optional()
});

export const getParticipants = async (req, res) => {
    try {
        const search = req.query.search || '';
        const q = `%${search}%`;

        // استخراج الـ page والـ limit من الـ Query Parameters (مع قيم افتراضية)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // تنفيذ استعلام SQL مع LIMIT و OFFSET
        const { rows } = await db.query(
            `SELECT * FROM participants 
             WHERE full_name ILIKE $1 OR email ILIKE $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [q, limit, offset]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createParticipant = async (req, res) => {
    const b = req.body;
    const { rows } = await db.query(
        'INSERT INTO participants(full_name,email,phone) VALUES($1,$2,$3) RETURNING *',
        [b.fullName, b.email.toLowerCase(), b.phone || null]
    );
    res.status(201).json(rows[0]);
};

export const updateParticipant = async (req, res) => {
    const b = req.body;
    const { rows } = await db.query(
        'UPDATE participants SET full_name=$1,email=$2,phone=$3,updated_at=NOW() WHERE id=$4 RETURNING *',
        [b.fullName, b.email.toLowerCase(), b.phone || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Participant introuvable.' });
    res.json(rows[0]);
};

export const deleteParticipant = async (req, res) => {
    const { rowCount } = await db.query('DELETE FROM participants WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Participant introuvable.' });
    res.status(204).end();
};
import db from '../config/db.js';
import { z } from '../middleware/validate.js';

// مخططات التحقق (Zod Schemas)
export const eventSchema = z.object({
    title: z.string().min(3).max(180),
    description: z.string().max(5000).default(''),
    location: z.string().min(2).max(180),
    eventDate: z.coerce.date(),
    maxParticipants: z.coerce.number().int().positive()
});

export const statusSchema = z.object({
    status: z.enum(['draft', 'published', 'cancelled'])
});

// جلب جميع الفعاليات مع دعم الفلترة والتصفح (Pagination)
export const getAllEvents = async (req, res) => {
    const values = [];
    const where = [];

    if (req.query.status) {
        values.push(req.query.status);
        where.push(`e.status = $${values.length}`);
    }

    if (req.query.date) {
        values.push(req.query.date);
        where.push(`e.event_date::date = $${values.length}`);
    }

    // إعدادات الـ Pagination (الافتراضي: 10 عناصر في الصفحة)
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    values.push(limit, offset);

    const queryStr = `
    SELECT 
      e.*, 
      u.full_name AS creator_name, 
      COUNT(r.id) FILTER (WHERE r.status <> 'cancelled')::int AS registration_count 
    FROM events e 
    JOIN users u ON u.id = e.created_by 
    LEFT JOIN registrations r ON r.event_id = e.id 
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} 
    GROUP BY e.id, u.full_name 
    ORDER BY e.event_date 
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

    const { rows } = await db.query(queryStr, values);
    res.json(rows);
};

// إنشاء حدث جديد
export const createEvent = async (req, res) => {
    const b = req.body;
    const { rows } = await db.query(
        `INSERT INTO events(title, description, location, event_date, max_participants, created_by) 
     VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
        [b.title, b.description, b.location, b.eventDate, b.maxParticipants, req.user.id]
    );
    res.status(201).json(rows[0]);
};

// جلب حدث مع تفاصيله والمشاركين فيه
export const getEventById = async (req, res) => {
    const { rows } = await db.query(
        `SELECT 
       e.*, 
       u.full_name AS creator_name, 
       COUNT(r.id) FILTER (WHERE r.status <> 'cancelled')::int AS registration_count 
     FROM events e 
     JOIN users u ON u.id = e.created_by 
     LEFT JOIN registrations r ON r.event_id = e.id 
     WHERE e.id = $1 
     GROUP BY e.id, u.full_name`,
        [req.params.id]
    );

    if (!rows[0]) {
        return res.status(404).json({ message: 'Événement introuvable.' });
    }

    const regs = await db.query(
        `SELECT r.*, p.full_name, p.email, p.phone 
     FROM registrations r 
     JOIN participants p ON p.id = r.participant_id 
     WHERE r.event_id = $1 
     ORDER BY r.created_at DESC`,
        [req.params.id]
    );

    res.json({ ...rows[0], registrations: regs.rows });
};

// تعديل بيانات الحدث
export const updateEvent = async (req, res) => {
    const b = req.body;
    const { rows } = await db.query(
        `UPDATE events 
     SET title = $1, description = $2, location = $3, event_date = $4, max_participants = $5, updated_at = NOW() 
     WHERE id = $6 RETURNING *`,
        [b.title, b.description, b.location, b.eventDate, b.maxParticipants, req.params.id]
    );

    if (!rows[0]) {
        return res.status(404).json({ message: 'Événement introuvable.' });
    }

    res.json(rows[0]);
};

// تحديث حالة الحدث (Draft, Published, Cancelled)
export const updateEventStatus = async (req, res) => {
    const { rows } = await db.query(
        `UPDATE events 
     SET status = $1, updated_at = NOW() 
     WHERE id = $2 RETURNING *`,
        [req.body.status, req.params.id]
    );

    if (!rows[0]) {
        return res.status(404).json({ message: 'Événement introuvable.' });
    }

    res.json(rows[0]);
};
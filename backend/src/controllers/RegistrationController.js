import db from '../config/db.js';
import { z } from '../middleware/validate.js';

// مخططات التحقق (Zod Schemas)
export const registrationSchema = z.object({
    eventId: z.union([z.string(), z.number()]),
    participantId: z.union([z.string(), z.number()]),
    status: z.enum(['pending', 'confirmed']).default('pending')
});

export const registrationStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled'])
});

// جلب جميع التسجيلات مع دعم الفلترة والتصفح (Pagination)
export const getRegistrations = async (req, res) => {
    const values = [];
    const where = [];

    if (req.query.eventId) {
        values.push(req.query.eventId);
        where.push(`r.event_id = $${values.length}`);
    }

    if (req.query.status) {
        values.push(req.query.status);
        where.push(`r.status = $${values.length}`);
    }

    // إعدادات الـ Pagination (الافتراضي: 10 عناصر في الصفحة)
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    values.push(limit, offset);

    const queryStr = `
    SELECT 
      r.*, 
      e.title AS event_title, 
      p.full_name, 
      p.email 
    FROM registrations r 
    JOIN events e ON e.id = r.event_id 
    JOIN participants p ON p.id = r.participant_id 
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} 
    ORDER BY r.created_at DESC 
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

    const { rows } = await db.query(queryStr, values);
    res.json(rows);
};

// إنشاء تسجيل جديد (مع التحقق من حالة الفعالية والسعة المسموحة)
export const createRegistration = async (req, res) => {
    const b = req.body;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // التحقق من وجود الفعالية وحجزها لتجنب سباق البيانات
        const eventQuery = await client.query(
            'SELECT * FROM events WHERE id = $1 FOR UPDATE',
            [b.eventId]
        );
        const event = eventQuery.rows[0];

        if (!event) {
            throw Object.assign(new Error('Événement introuvable.'), { status: 404 });
        }

        if (event.status !== 'published') {
            throw Object.assign(new Error('Inscription possible uniquement sur un événement publié.'), { status: 400 });
        }

        // التحقق من عدد المشاركين الحاليين
        const countQuery = await client.query(
            "SELECT COUNT(*)::int AS n FROM registrations WHERE event_id = $1 AND status <> 'cancelled'",
            [b.eventId]
        );
        const count = countQuery.rows[0].n;

        if (count >= event.max_participants) {
            throw Object.assign(new Error('Événement complet.'), { status: 400 });
        }

        // إتمام عملية التسجيل
        const { rows } = await client.query(
            `INSERT INTO registrations(event_id, participant_id, status) 
       VALUES($1, $2, $3) RETURNING *`,
            [b.eventId, b.participantId, b.status || 'pending']
        );

        await client.query('COMMIT');
        res.status(201).json(rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// تحديث حالة التسجيل (pending, confirmed, cancelled)
export const updateRegistrationStatus = async (req, res) => {
    const { rows } = await db.query(
        `UPDATE registrations 
     SET status = $1, updated_at = NOW() 
     WHERE id = $2 RETURNING *`,
        [req.body.status, req.params.id]
    );

    if (!rows[0]) {
        return res.status(404).json({ message: 'Inscription introuvable.' });
    }

    res.json(rows[0]);
};
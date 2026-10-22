import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getProjects, getSkills, saveContactMessage } from '../db.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages. Please try again later.' }
});

router.get('/projects', async (_req, res, next) => {
  try { res.json({ success: true, data: await getProjects() }); } catch (err) { next(err); }
});

router.get('/skills', async (_req, res, next) => {
  try { res.json({ success: true, data: await getSkills() }); } catch (err) { next(err); }
});

function validateContact(body) {
  const str = v => (typeof v === 'string' ? v.trim() : '');
  const message = { name: str(body?.name), email: str(body?.email).toLowerCase(), subject: str(body?.subject), message: str(body?.message) };
  if (message.name.length < 2 || message.name.length > 100) return { error: 'Name must be between 2 and 100 characters.' };
  if (!EMAIL_RE.test(message.email) || message.email.length > 254) return { error: 'Please enter a valid email address.' };
  if (message.subject.length > 200) return { error: 'Subject must be 200 characters or fewer.' };
  if (message.message.length < 10 || message.message.length > 5000) return { error: 'Message must be between 10 and 5000 characters.' };
  return { message };
}

router.post('/contact', contactLimiter, async (req, res, next) => {
  const { error, message } = validateContact(req.body);
  if (error) return res.status(400).json({ success: false, message: error });
  try {
    await saveContactMessage(message);
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) { next(err); }
});

export default router;

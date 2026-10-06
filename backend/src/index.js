import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`EventHub API listening on ${port}`));

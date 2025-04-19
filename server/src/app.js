import express from 'express'
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import commentRoutes from './routes/commentRoutes.js'
import bodyParser from 'body-parser';
import cors from 'cors';
import sharedRoutes from './routes/sharedRoutes.js';

const app = express();

app.use(cors());
app.use(express.json({limit:"16kb"}));
app.use(cookieParser());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/shared', sharedRoutes)

export {app}
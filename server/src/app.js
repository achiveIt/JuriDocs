import express from 'express'
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import commentRoutes from './routes/commentRoutes.js'
import bodyParser from 'body-parser';
import cors from 'cors';
import sharedRoutes from './routes/sharedRoutes.js';
import sendInviteMailRoutes from './routes/sendInviteMailRoute.js';

const app = express();
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
    credentials: true,               
  };

app.use(cors(corsOptions));
app.use(express.json({limit:"16kb"}));
app.use(cookieParser());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/shared', sharedRoutes)
app.use('/api/mailInvite', sendInviteMailRoutes)

export {app}
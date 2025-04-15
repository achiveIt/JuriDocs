import express from 'express'
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js'
import bodyParser from 'body-parser';
import cors from 'cors'

const app = express();

app.use(cors());
app.use(express.json({limit:"16kb"}));
app.use(cookieParser());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

export {app}
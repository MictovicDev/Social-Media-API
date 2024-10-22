import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';


dotenv.config();
connectDB();
const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json()); // to parse json data to the request.body
app.use(express.urlencoded({extended:true})); //To parse form data in the req.body
app.use(cookieParser());

//Routes
app.use("/api/users", userRoutes)

app.listen(PORT, ()=>{
    console.log(`Server started on port http://localhost:${PORT}`)
});

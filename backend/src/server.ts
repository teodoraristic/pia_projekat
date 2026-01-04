import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routers/user.router";
import cabinRouter from "./routers/cabin.router";
import reservationRouter from "./routers/reservation.router";
import fileUpload from "express-fileupload";
import path from "path";

const app = express();

// CORS mora biti pre svih drugih ruta
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect("mongodb://127.0.0.1:27017/planinskaVikendica");
const connection = mongoose.connection;

connection.once("open", () => {
  console.log("DB connection OK");
});

connection.on("error", (err) => {
  console.log("DB connection error:", err);
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(fileUpload());

app.use('/images', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (req.path.endsWith('.png')) {
    res.setHeader('Content-Type', 'image/png');
  }
  
  next();
});

app.use('/images', express.static(path.join(__dirname, '..', 'images')));

const router = express.Router();
router.use("/users", userRouter);
router.use("/cabins", cabinRouter);
router.use("/reservations", reservationRouter);

app.use("/api", router);

app.listen(4000, () => console.log(`Express server running on port 4000`));
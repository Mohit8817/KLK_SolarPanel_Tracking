import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
dotenv.config()
import ConnectDb from "./config/db.js";
import userRoutes from './routes/user.routes.js'
import taskRoutes from './routes/task.routes.js'
import loginroutes from  './routes/authroutes/login.routes.js'
import panelseriallotroutes from './routes/panelseriallot.routes.js'
import productionopanelroures from './routes/productionpanel.routes.js'
import dispatchpanelroures from './routes/dispatchpanel.routes.js'
import damagepanelroures from './routes/damagepanel.routes.js'
import dashboardroutes from './routes/dashboard.routes.js'


const app = express()
app.use(express.json())

app.use(
  cors({
    origin: ["http://localhost:5173", "http://klkventures.cloud"],
    credentials: true,
  })
);


// Configure session
app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true } // secure: true if HTTPS
}));


app.use(express.urlencoded({ extended: true }))

import {auth} from './middleware/auth.js'

ConnectDb()

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


app.use("/api/login", loginroutes)

app.use(auth)
app.use("/api/dashboard", dashboardroutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes)
app.use("/api/panels", panelseriallotroutes)
app.use("/api/production", productionopanelroures)
app.use("/api/dispatch", dispatchpanelroures)
app.use("/api/damage", damagepanelroures)


app.listen(3000, () => {
    console.log('server is runing on port 3000');
})
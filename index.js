import express from "express";
import cookieParser from "cookie-parser";
import router from "./routes/Router.js";
import mongoose from "mongoose";

const app = express();
const port = 5000;

app.use((req, res, next) => {
    // res.setHeader("Access-Control-Allow-Origin", "https://cooltalks.vercel.app");
    // res.header(
    //     "Access-Control-Allow-Headers",
    //     "Origin, X-Requested-With, Content-Type, Accept"
    // );
  res.header('Access-Control-Allow-Origin', 'https://cooltalks.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  // next();
    next();
})
app.use(express.json({limit: '5024mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// DB
const dbName = "/coolTalks";
const url = "mongodb+srv://jaundev768:DevOps123@cluster-1.szlfag2.mongodb.net";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect(url + dbName, options);


// All Routes
app.use(router);



app.listen(port, (()=>{
    console.log(`Server is running on ${port}`)
}))


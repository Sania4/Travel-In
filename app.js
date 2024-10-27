if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session =  require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js")

const listingsRouter = require("./routes/listing.js");
const reviewRouter =  require("./routes/review.js");
const userRouter =  require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/Travel-In";
const dbUrl = process.env.ATLASDB_URL;

main()
    .then ( () => {
        console.log("Connected to DataBase");
    })
    .catch((err) => {
        console.log(err)
    });

async function main() {
    await mongoose.connect(dbUrl)
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true})); 
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err)
})

const sessionOptions = {
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now(),
        // maxAge: 7 *24 *60 *60 *1000,
        httpOnly: true,
    }
}

// app.get("/", (req,res,) => {
//     res.send("Hi, I'm root");
// })


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success =  req.flash("success");
    res.locals.error =  req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//DEMO USER
// app.get("/demouser", async(req,res)=>{
//     let fakerUser = new User ({
//         email: "mw@gmail.com",
//         username: "student"
//     });

//     let registeredUser = await User.register(fakerUser, "password");
//     res.send(registeredUser); 
// })

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use( (err,req,res,next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    // res.status(statusCode).send(message)
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, ()=>{
    console.log("Server is listening on port 8080");
});
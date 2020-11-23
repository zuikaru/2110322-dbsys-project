const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const mongoose = require("mongoose");
const db = require("./services/database");
require("handlebars-helpers")();
require("express-async-errors");
const app = express();
const port = 8080;

// Setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  autoIndex: true,
  useFindAndModify: false
});
app.use(cookieParser(process.env.SECRET));
var myStore = new SequelizeStore({
  db: db
});
app.use(
  session({
    name: "sid",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: myStore,
    cookie: { maxAge: 3600 * 1000, httpOnly: true, secure: true }
  })
);
myStore.sync();
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.engine("hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", "./src/views");
app.set("trust proxy", true);
// Variable
app.use(function (req, res, next) {
  res.locals.path = req.path;
  res.locals.message = req.flash("message");
  next();
});
app.locals.title = "App";

// Routes
const indexController = require("./controllers/index.controller");
app.get("/", indexController.getIndex);
const userController = require("./controllers/user.controller");
app.get("/users", userController.getUsers);
app.post("/users", userController.postAddUser);
app.post("/users/delete", userController.postDeleteUser);
app.post("/users/edit", userController.postEditPassword);
app.post("/users/mirror/mongodb", userController.postMirrorToMongoDB);

// Error handler
app.use(async (req, res, next) => {
  res.status(404).render("404");
});
app.use(async (err, req, res, next) => {
  console.log(err);
  res.status(500).render("500", { message: err.stack });
});

// Start
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

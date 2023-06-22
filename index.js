import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

// mongodb://127.0.0.1:27017
// mongodb://localhost:27017
mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

//Using middleware
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//setting up View Engine
app.set("view engine", "ejs");

// ****authentication middleware*** */
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "asdfghjkl");

    req.user = await User.findById(decoded._id);

    next();
  } else {
    res.redirect("/login");
  }
};

//***AUTHENTICATION****login page start**** */

//niche wla hi h [login page] bs middleware ke lia isko bnre h!!{SHORTCUT}
app.get("/", isAuthenticated, (req, res) => {
  // console.log(req.user);
  res.render("logout", { name: req.user.name });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user) return res.redirect("/register");

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch)
    return res.render("login", { email, message: "Incorrect Password" });

  //using jwt to read token
  const token = jwt.sign({ _id: user._id }, "asdfghjkl");
  // console.log(token);

  res.cookie("token", token, {
    httpOnly: true, //import for security
    expires: new Date(Date.now() + 10 * 1000), //automatically deletes
  });
  res.redirect("/");
});

//for login page
// app.get("/", (req, res) => {
//   const token = req.cookies.token;
//   //we can use this if else as a middleware also line-34
//   if (token) {
//     res.render("logout");
//   } else {
//     res.render("login");
//   }

//   // res.render("login");
// });

app.post("/register", async (req, res) => {
  // console.log(req.body);
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    //form submit ke tym user ni mila toh ye
    return res.redirect("/login");
  }

  //hashing password
  const hashedPassword = await bcryptjs.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  //using jwt to read token
  const token = jwt.sign({ _id: user._id }, "asdfghjkl");
  // console.log(token);

  res.cookie("token", token, {
    httpOnly: true, //import for security
    expires: new Date(Date.now() + 10 * 1000), //automatically deletes
  });
  res.redirect("/");
});

//logout page
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

//***login page end**** */

//For normal contact page
// app.get("/", (req, res) => {
//   res.render("index", { name: "sumit" });
// });

// app.get("/add", async (req, res) => {
//   await Message.create({ name: "summo", email: "Sample@gmail.com" });
//   res.send("Nice");
// });

//mongodb me data jra h!!
// app.post("/contact", async (req, res) => {
// console.log(req.body);
// const messageData = { username: req.body.name, email: req.body.email };

//method using async await
// await Message.create({ name: req.body.name, email: req.body.email });
// res.redirect("/success");

//method using destructuring

//   const { name, email } = req.body;
//   await Message.create({ name, email });
//   res.redirect("/success");
// });

//api bnre h
// app.get("/users", (req, res) => {
//   res.json({
//     users,
//   });
// });

app.listen(5000, () => {
  console.log("server is working");
});

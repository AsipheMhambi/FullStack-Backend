const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "jskhdfkjhwkef378743jkbskjdf@$^kjkjh[]{}hsfcv";


const password = "19950625";
const mongourl = `mongodb+srv://AsipheMhambi:${password}@cluster0.m6m1kic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(mongourl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to database");
}).catch(e => console.log(e));


require("./userDetails");
const User = mongoose.model("UserInfo");


app.post("/post", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ status: "error", message: "User not found" });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ status: "error", message: "Invalid password" });
    }

    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '2h' });
    res.send({ status: "ok", token });

  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", message: "Something went wrong, try again" });
  }
});

app.post("/register", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);

  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send({ status: "error", message: "User already exists" });
    }
    await User.create({
      fname,
      lname,
      email,
      password: encryptedPassword,
    });
    res.status(201).send({ status: "ok" });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Error registering user" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

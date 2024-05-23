const express = require("express");
const db = require("./db");
const app = express();
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const SignUpmodal = require("./user-schema-modal/signupSchema");
const proModal = require('./user-schema-modal/proModel')
const {
  createToken,
  hashPassword,
  comparePassword,
  verifyToken,
} = require("./utils");
app.use(cors());
app.use(express.json());
dotenv.config();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("new user connected: ", socket.id);

  socket.on("send-code", async (data) => {
    await proModal.findByIdAndUpdate(data.id, {
      [data.lang]: data.value,
    });

    io.emit("received-code", data);
  });
});

// Sign Up
app.post("/user/sign-up", async (req, res) => {
  try {
    const user = req.body;

    const findDuplicateEmail = await SignUpmodal.findOne({ email: user.email });

    if (findDuplicateEmail) {
      return res.status(400).send("Email already exists");
    }

    user.name = user.name;
    user.password = await hashPassword(user.password);

    const newUser = await SignUpmodal.create(user);
    console.log(newUser);
    console.log(newUser._id);
    const token = createToken({ id: newUser._id });
    console.log(token);
    res.status(201).send({ token, newUser: newUser , userId: newUser._id });
  } catch (error) {
    res.status(500).send(error);
  }
});

// log-in

app.post("/user/login", async (req, res) => {
  try {
    const user = req.body;
    const findUser = await SignUpmodal.findOne({ email: user.email });

    if (!findUser) {
      return res.status(400).send("Invalid email");
    }
    const isMatch = comparePassword(user.password, findUser.password);

    if (!isMatch) {
      return res.status(400).send("Invalid password");
    }
    const token = createToken({ id: findUser._id });
    res.status(200).send({ token: token, user: findUser ,userId: findUser._id });
  } catch (error) {
    res.status(500).send(error);
  }
});

// forgot password

app.post("/user/forgot-password", async (req, res) => {
  try {
    const user = req.body;

    const findUser = await SignUpmodal.findOne({ email: user.email });

    if (!findUser) {
      return res.status(400).send("Invalid email");
    }
    const token = createToken({ id: findUser._id });

    const url = `http://localhost:5173/new-password?token=${token}`;

    res.status(200).send(url);
  } catch (error) {
    res.status(500).send(error);
  }
});

// new password

app.post("/user/create-new-password", async (req, res) => {
  try {
    const user = req.body;

    const veryfyId = verifyToken(user.token);

    if (veryfyId) {
      const hashpass = await hashPassword(user.password);

      const updatedData = await SignUpmodal.findByIdAndUpdate(veryfyId.id, {
        password: hashpass,
      });
      console.log(updatedData);
      res.status(200).send("password updated successfully");
    } else {
      res.status(400).send("Invalid token");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//  Show All Projects

app.get("/user/create-new-projects/:userId", async (req, res) => {
  try {
      const { userId } = req.params;
      const newProject = await proModal.create({ userID: userId });

      res.status(200).send(newProject);
  } catch (err) {
      res.status(500).send("Something went wrong.");
  }
});


//  find all projects in user

app.get("/user/all-Projects/:userId",async(req, res) =>{
  try {
    const { userId } = req.params;
    const Project = await proModal.find({ userID: userId});
    res.status(200).send(Project)
    
  } catch (error) {
    res.status(500).send(error);
  }

})

//  get perticular User project
app.get('/user/project/:id', async(req, res)=>{
try {
  const {id} = req.params;
  const project = await proModal.findById(id);
  res.status(200).send(project)
} catch (error) {
  res.status(500).send(error);
}
})


// testing
app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, (req, res) => {
  console.log("Server is running on port 5000");
});

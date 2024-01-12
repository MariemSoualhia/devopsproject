const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const Place = require("./models/Place.js");
const Booking = require("./models/Booking.js");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const PORT = 4000;

require("dotenv").config();
const app = express();
const MONGO_URL = process.env.MONGO_URL || "default-mongo-url";
const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";
const CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME || "default-cloud-name";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "default-api-key";
const CLOUDINARY_API_SECRET =
  process.env.CLOUDINARY_API_SECRET || "default-api-secret";

const bcryptSalt = bcrypt.genSaltSync(10);

app.use(express.json());
app.use(cookieParser());

async function main() {
  try {
    await connectToDB(); // Connect to MongoDB
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

app.use(
  cors({
    credentials: true,
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

async function connectToDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB...");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies.token;
    if (!token) {
      return reject({ message: "Token not found" });
    }
    jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
      if (err) {
        return reject(err);
      }
      resolve(userData);
    });
  });
}

app.get("/api/test", (req, res) => {
  mongoose.connect(MONGO_URL);
  res.json("test ok");
});
app.post("/api/test", (req, res) => {
  res.json("testing");
});
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post("/api/login", async (req, res) => {
  mongoose.connect(MONGO_URL);
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        {
          email: userDoc.email,
          id: userDoc._id,
        },
        JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.json("not found");
  }
});

app.get("/api/profile", (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name, email, _id } = await User.findById(userData.id);
    res.json({ name, email, _id });
  });
});

app.post("/api/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.post('/api/upload-by-link', async (req, res) => {
  const { fileUrl } = req.body;
  try {
    const uploadedFile = await cloudinary.uploader.upload(fileUrl, { resource_type: 'auto' });
    res.status(200).json({ message: 'File uploaded to Cloudinary', uploadedFile });
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    res.status(500).json({ message: 'Error uploading file to Cloudinary' });
  }
});

const photosMiddleware = multer({ dest: "/tmp" });

app.post("/api/places", (req, res) => {
  mongoose.connect(MONGO_URL);
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    price,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;
  jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner: userData.id,
      price,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    });
    res.json(placeDoc);
  });
});

app.post(
  "/api/upload",
  photosMiddleware.array("photos", 100),
  async (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { path } = req.files[i];
      const result = await cloudinary.uploader.upload(path);
      uploadedFiles.push(result.secure_url);
    }
    res.json(uploadedFiles);
  }
);

app.get("/api/user-places", (req, res) => {
  mongoose.connect(MONGO_URL);

  const { token } = req.cookies;
  jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
    if (userData && userData.id) {
      const { id } = userData;
      res.json(await Place.find({ owner: id }));
    } else {
      res.json({ message: "error to execute" });
    }
  });
});

app.get("/api/places/:id", async (req, res) => {
  mongoose.connect(MONGO_URL);
  const { id } = req.params;
  res.json(await Place.findById(id));
});

app.put("/api/places", async (req, res) => {
  mongoose.connect(MONGO_URL);
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("ok");
    }
  });
});

app.get("/api/places", async (req, res) => {
  mongoose.connect(MONGO_URL);
  res.json(await Place.find());
});

app.post("/api/bookings", async (req, res) => {
  mongoose.connect(MONGO_URL);
  const userData = await getUserDataFromReq(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/api/bookings", async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const bookings = await Booking.find({ user: userData.id }).populate(
      "place"
    );
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

main();
module.exports = app;
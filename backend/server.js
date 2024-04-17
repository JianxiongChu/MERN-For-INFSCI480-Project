import express from "express";
import mongoose from "mongoose";
import { PORT, url } from "./config.js";
import { User } from "./models/users.js";
import cors from "cors";
import md5 from "md5";

// Setup of DB connection
await mongoose
  .connect(url, { useNewUrlParser: true, retryWrites: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Initialization of Express.js app property
const app = express();
app.use(express.json()); // use middleware that automatically parses JSON formatted request bodies
app.use(cors(
  // NOTICE: uncommenting following brackets will allow this backend app to ONLY accept request coming from local host at port 3000
  // {
  //   origin: "http://localhost:3000",
  //   methods:[],
  //   allowHeader:[]
  // }
)); // enables Cross-Origin Resource Sharing (CORS) for application, allowing requests to be received from other domains

// Default GET endpoint for generic information processing, negligible
app.get("/", async (request, response) => {
  try {
    response.status(200).send("Acknowledged!");
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// GET endpoint for retrieving all user records from target database
app.get("/users", async (request, response) => {
  try {
    const users = await User.findOne({}).select("-_id"); // filters out default ID created by MongoDB

    response.status(200).send(users);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// GET for retrieving one user by email
// Use case: displaying user info on user page
app.get("/users/:email/", async (request, response) => {
  try {
    const user = await User.findOne({email:request.params.email})

    response.status(200).send(user);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// GET for retrieving one user's visit history
app.get("/users/:email/get-article-visits", async (request, response) => {
  try {
    const user = await User.findOne({email:request.params.email})

    response.status(200).send(user.visitHistory);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// GET for retrieving one user's preferred keywords
app.get("/users/get-preferred-keywords", async (request, response) => {
  try {
    const users = await User.findOne({email:request.params.email})

    response.status(200).send(user.preferredKeyword);
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// POST endpoint for adding a new user.
app.post("/users", async (request, response) => {
  try {
    const newUser = request.body;
    if (
      Object.keys(newUser).length !== 6 ||
      !newUser.name ||
      !newUser.email ||
      !newUser.phone ||
      !newUser.password
    ) {
      response
        .status(422)
        .send("Data fields incompaitible, cannot process request");
    }

    // IMPORTANT: requests are expected to send MD5 encrypted passwords, to avoid MITM attacks
    // Only for debugging
    // newUser.password = newUser.password
    newUser.password = md5(newUser.password);

    const user = User.create(newUser);

    response.status(202).json("Complete");
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// PUT endpoint for modification of individual user
// Include all fields with modified values in request body, and target user email in reuqest route(e.g. "/users/abc@123.com")
app.put("/users/:email", async (request, response) => {
  try {
    const modifiedFields = request.body;
    const targetUserEmail = request.params.email;

    if (Object.keys(modifiedFields).length > 3 || !targetUserEmail) {
      response
        .status(422)
        .send("Data fields incompaitible, cannot process request");
    }

    const targetUser = await User.findOne({ email: targetUserEmail });

    // Only for debugging
    if (modifiedFields.password) {
      modifiedFields.password = md5(modifiedFields.password);
    }

    Object.assign(targetUser, modifiedFields);
    await targetUser.save();

    response.status(202).json("Complete");
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// PUT endpoint for adding a single article visit to the record
// This endpoint has no body, and the two parameters to be store are included within URL params
app.put(
  "/users/:email/article-visit/visited=:articleId&date=:date",
  async (request, response) => {
    try {
      const targetUserEmail = request.params.email;

      const targetUser = await User.findOne({ email: targetUserEmail });
      const modification = {
        visitHistory: [
          ...targetUser.visitHistory,
          { articleId: request.params.articleId, date: request.params.date },
        ],
      };

      Object.assign(targetUser, modification);
      await targetUser.save();

      response.status(202).json("Complete");
    } catch (error) {
      response.status(500).send(error.message);
    }
  }
);

// PUT endpoint for adding a keyword to user preference
// This endpoint has no body
app.put("/users/:email/addkw/:keyword", async (request, response) => {
  try {
    const targetUserEmail = request.params.email;

    const targetUser = await User.findOne({ email: targetUserEmail });
    const targetKeyword = request.params.keyword;
    const modification = {
      preferredKeyword: [...targetUser.preferredKeyword, targetKeyword],
    };

    Object.assign(targetUser, modification);
    await targetUser.save();

    response.status(202).json("Complete");
  } catch (error) {
    response.status(500).send(error.message);
  }
});

// PUT endpoint for removing a keyword from user preference
// This endpoint has no body
app.put("/users/:email/removekw/:keyword", async (request, response) => {
  try {
    const targetUserEmail = request.params.email;

    const targetUser = await User.findOne({ email: targetUserEmail });
    const targetKeyword = request.params.keyword;
    const modification = {
      preferredKeyword: [
        ...targetUser.preferredKeyword.filter((keyword) => {
          keyword != targetKeyword;
        }),
      ],
    };

    Object.assign(targetUser, modification);
    await targetUser.save();

    response.status(202).json("Complete");
  } catch (error) {
    response.status(500).send(error.message);
  }
});



// Listens on designated port by env variable provided by config.js
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

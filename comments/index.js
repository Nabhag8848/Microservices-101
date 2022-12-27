const express = require("express");
const app = express();
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const commentsByPostId = {};

app.use(bodyParser.json());
app.use(cors());

app.get("/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  res.status(200).send(commentsByPostId[id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const { id } = req.params;
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[id] || [];

  comments.push({
    id: commentId,
    content,
  });

  commentsByPostId[id] = comments;

  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: id,
    },
  });
  res.status(201).send(comments);
});

app.post("/events", (req, res) => {
  console.log("received event in comment service- ", req.body.type);
  res.send({});
});

app.listen(4001, () => console.log("listening on 4001"));

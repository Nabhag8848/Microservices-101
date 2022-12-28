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
    status: 'pending'
  });

  commentsByPostId[id] = comments;

  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: id,
      status:'pending'
    },
  });
  res.status(201).send(comments);
});

app.post("/events",async (req, res) => {
  console.log("received event in comment service- ", req.body.type);

  const {type, data} = req.body;

  switch(type){
    case 'CommentModerated': {

      const {status, postId, content, id } = data;
      const comments = commentsByPostId[postId];

      const comment = comments.find(comment => comment.id === id);
      comment.status = status;
      await axios.post("http://localhost:4005/events", {
        type: 'CommentUpdated',
        data: {
          postId,
          status,
          content,
          id
        }
      })

      break;
    }

    default: {
      console.log('Not an interested event - ', type);
    }
  }
  res.send({});
});

app.listen(4001, () => console.log("listening on 4001"));

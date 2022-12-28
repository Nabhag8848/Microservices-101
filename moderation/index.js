const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  switch (type) {
    case "CommentCreated": {
      const { content, postId, id } = data;
      const status = content.includes("orange") ? "rejected" : "approved";

      await axios.post("http://localhost:4005/events", {
        type: "CommentModerated",
        data: { id, content, postId, status },
      });
    }

    default: {
      console.log(`Doesn't care about the event - `, type);
    }
  }

  res.send({});
});

app.listen(4003, () => {
  console.log("listening on 4003");
});

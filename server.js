import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let queue = [];

// Add post
app.post("/queue", (req, res) => {
  const post = { ...req.body, id: Date.now(), status: "pending" };
  queue.push(post);
  res.json(post);
});

// Get queue
app.get("/queue", (req, res) => {
  res.json(queue);
});

// Twitter post
async function postToTwitter(text) {
  try {
    await axios.post(
      "https://api.twitter.com/2/tweets",
      { text },
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER}`
        }
      }
    );
    console.log("Posted:", text);
  } catch (err) {
    console.error("Twitter error:", err.response?.data || err.message);
  }
}

// Scheduler
cron.schedule("*/1 * * * *", async () => {
  console.log("Running scheduler...");

  for (let post of queue) {
    if (post.status === "pending") {
      await postToTwitter(post.text);
      post.status = "posted";
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));;

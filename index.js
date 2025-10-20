const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ratelimit = require("express-rate-limit");

const app = express();
app.use(express.json());

//rate limiter
const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

//logging
app.use(morgan("combined"));
app.use(limiter);

const PORT = process.env.PORT || 3000;

//time function to get current date and time in ISO 8601 format
function getCurrentISODateTime() {
  return new Date().toISOString();
}

const controller = new AbortController();
const signal = controller.signal;

// Set a timeout to abort the request after 5 seconds (5000 milliseconds)
const timeoutId = setTimeout(() => controller.abort(), 10000);

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET",
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

app.get("/me", (request, response) => {
  response.setHeader("Content-Type", "application/json");
  fetch("https://catfact.ninja/fact", { signal })
    .then((response) => {
      clearTimeout(timeoutId); // Clear the timeout if the request completes successfully
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      response.json({
        status: "success",
        user: {
          email: "kojowest2012@gmail.com",
          name: "Amadu Kargbo",
          stack: "NodeJs/Express",
        },
        timestamp: getCurrentISODateTime(),
        fact: data,
      });
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        console.error("Fetch request timed out:", error);
      } else {
        console.error("Fetch error:", error);
      }
    });
});

app.listen(PORT, () => {
  console.log(`Server Listening on PORT: ${PORT}`);
});

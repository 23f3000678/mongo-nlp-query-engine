const axios = require("axios");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

let usersCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const db = client.db("nlp_demo");
    usersCollection = db.collection("users");

  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// 🔥 NEW ROUTE - Fetch All Users
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});
app.post("/query", async (req, res) => {
  try {
    const userInput = req.body.query;
    if (!userInput) {
      return res.status(400).json({ error: "No query provided" });
    }

    const lowerInput = userInput.toLowerCase();

    // 🔒 Safety Layer
    const dangerousKeywords = ["delete", "drop", "update", "remove", "insert"];
    for (let word of dangerousKeywords) {
      if (lowerInput.includes(word)) {
        return res.status(403).json({
          error: "Operation not allowed. Read-only queries only."
        });
      }
    }

    let filter = {};
    let explanation = [];
    let intent = "find";
    let sortField = null;
    let sortOrder = 1;
    let limitValue = 0;

    // 🔹 Call spaCy NLP service
    const nlpResponse = await axios.post("http://nlp:8000/analyze", {
      query: userInput
    });

    const entities = nlpResponse.data.entities;
    const numbers = nlpResponse.data.numbers;

    explanation.push("spaCy NLP analysis completed.");

    // 🔹 Intent Detection
    if (lowerInput.includes("count") || lowerInput.includes("how many")) {
      intent = "count";
      explanation.push("Detected COUNT intent.");
    }

    if (lowerInput.includes("total") && lowerInput.includes("city")) {
      intent = "aggregate";
      explanation.push("Detected AGGREGATION intent (group by city).");
    }

    // 🔹 Schema Detection
    const sampleDoc = await usersCollection.findOne();
    const fieldNames = Object.keys(sampleDoc).filter(f => f !== "_id");

    const stringFields = [];
    const numberFields = [];

    for (let field of fieldNames) {
      if (typeof sampleDoc[field] === "string") stringFields.push(field);
      if (typeof sampleDoc[field] === "number") numberFields.push(field);
    }

    // 🔹 GPE → City Detection
    const gpeEntities = entities.filter(ent => ent.label === "GPE");
    if (gpeEntities.length > 0) {
      const detectedLocation = gpeEntities[0].text;
      const cities = await usersCollection.distinct("city");

      const matchedCity = cities.find(
        city => city.toLowerCase() === detectedLocation.toLowerCase()
      );

      if (matchedCity) {
        filter.city = matchedCity;
        explanation.push(`Detected location using spaCy (GPE): ${matchedCity}`);
      }
    }

    // 🔹 PERSON → Name Detection
    const personEntities = entities.filter(ent => ent.label === "PERSON");
    if (personEntities.length > 0) {
      const detectedName = personEntities[0].text;
      const names = await usersCollection.distinct("name");

      const matchedName = names.find(
        name => name.toLowerCase() === detectedName.toLowerCase()
      );

      if (matchedName) {
        filter.name = matchedName;
        explanation.push(`Detected PERSON using spaCy: ${matchedName}`);
      }
    }

    // 🔹 DATE Detection
    const dateEntities = entities.filter(ent => ent.label === "DATE");
    if (dateEntities.length > 0) {
      const detectedDateText = dateEntities[0].text.toLowerCase();

      const monthMap = {
        january: "01", february: "02", march: "03",
        april: "04", may: "05", june: "06",
        july: "07", august: "08", september: "09",
        october: "10", november: "11", december: "12"
      };

      for (let month in monthMap) {
        if (detectedDateText.includes(month)) {
          const monthNumber = monthMap[month];

          if (lowerInput.includes("after")) {
            filter.joinDate = { $gt: `2023-${monthNumber}-01` };
            explanation.push(`Detected DATE: after ${month}`);
          }

          if (lowerInput.includes("before")) {
            filter.joinDate = { $lt: `2023-${monthNumber}-01` };
            explanation.push(`Detected DATE: before ${month}`);
          }

          if (lowerInput.includes("in")) {
            filter.joinDate = {
              $gte: `2023-${monthNumber}-01`,
              $lt: `2023-${monthNumber}-31`
            };
            explanation.push(`Detected DATE: in ${month}`);
          }
        }
      }
    }

    // 🔹 Numeric Filtering (ML-based)
    const synonymMap = {
      amount: "purchaseAmount",
      purchase: "purchaseAmount",
      age: "age"
    };

    for (let key in synonymMap) {
      if (lowerInput.includes(key)) {
        explanation.push(`Mapped term '${key}' to field '${synonymMap[key]}'`);
      }
    }

    if (numbers.length > 0) {
      const value = parseInt(numbers[0]);

      for (let field of numberFields) {
        if (lowerInput.includes(field.toLowerCase()) ||
            Object.values(synonymMap).includes(field)) {

          if (lowerInput.includes("greater") || lowerInput.includes("above")) {
            filter[field] = { $gt: value };
            explanation.push(`Applied filter: ${field} > ${value}`);
          }

          if (lowerInput.includes("less") || lowerInput.includes("below")) {
            filter[field] = { $lt: value };
            explanation.push(`Applied filter: ${field} < ${value}`);
          }
        }
      }
    }

    // 🔹 Sorting
    for (let field of fieldNames) {
      if (lowerInput.includes(`sorted by ${field.toLowerCase()}`)) {
        sortField = field;
        explanation.push(`Sorting by ${field}`);
      }
    }

    if (lowerInput.includes("descending") || lowerInput.includes("top")) {
      sortOrder = -1;
    }

    // 🔹 Limit
    if (numbers.length > 0 && lowerInput.includes("top")) {
      limitValue = parseInt(numbers[0]);
      explanation.push(`Limiting results to top ${limitValue}`);
    }

    explanation.push("Operation restricted to read-only mode.");

    // 🔹 COUNT
    if (intent === "count") {
      const count = await usersCollection.countDocuments(filter);
      return res.json({
        summary: `There are ${count} record(s) matching your query.`,
        intentDetected: intent,
        filtersApplied: filter,
        explanation,
        data: { count }
      });
    }

    // 🔹 AGGREGATE
    if (intent === "aggregate") {
      const aggregationResult = await usersCollection.aggregate([
        {
          $group: {
            _id: "$city",
            totalPurchase: { $sum: "$purchaseAmount" },
            userCount: { $sum: 1 }
          }
        }
      ]).toArray();

      return res.json({
        summary: "Aggregation completed successfully.",
        intentDetected: intent,
        explanation,
        data: aggregationResult
      });
    }

    // 🔹 FIND
    let query = usersCollection.find(filter);

    if (sortField) {
      query = query.sort({ [sortField]: sortOrder });
    }

    if (limitValue > 0) {
      query = query.limit(limitValue);
    }

    const results = await query.toArray();

    return res.json({
      summary: `Found ${results.length} record(s) matching your query.`,
      intentDetected: intent,
      filtersApplied: filter,
      explanation,
      data: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing query" });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
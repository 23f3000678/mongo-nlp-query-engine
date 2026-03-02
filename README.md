
# MongoAI – AI-Powered Natural Language Interface for MongoDB

## Overview

MongoAI is a production-ready Natural Language Interface for MongoDB that enables users to interact with databases using plain English instead of writing MongoDB queries manually.

The system converts natural language input into safe, schema-aware MongoDB queries using a hybrid architecture combining Machine Learning (spaCy NLP) and rule-based validation. It is built using a microservice architecture and fully containerized with Docker.

---

## Problem Statement

MongoDB is widely used for storing structured and semi-structured data. However, accessing data requires knowledge of MongoDB query syntax and schema structure.

This creates several challenges:

- Business users depend on developers for data access  
- Simple data requests cause delays  
- Repetitive query writing reduces productivity  
- Incorrect queries may lead to security risks  

There is a need for a safe, intelligent, and accessible interface that allows users to query MongoDB databases using natural language.

---

## Proposed Solution

MongoAI provides a Natural Language Query Engine that:

1. Accepts plain English input from users
2. Uses spaCy NLP for entity extraction (GPE, DATE, PERSON, numeric values)
3. Applies schema-aware validation against MongoDB collections
4. Generates safe read-only MongoDB queries
5. Returns structured results along with an explanation of how the query was interpreted

The system ensures safety by blocking destructive operations and validating all fields before execution.

---

## Architecture

```

User
↓
React Frontend (Tailwind UI)
↓
Node.js Backend (Express API)
↓
spaCy NLP Microservice (FastAPI)
↓
MongoDB Atlas (Cloud Database)

```

### Architecture Details

- Frontend: Handles user input and displays structured results
- Backend: Processes intent detection, filtering, validation, and query execution
- NLP Service: Performs Named Entity Recognition (NER) and number extraction
- Database: MongoDB Atlas (cloud-hosted)
- Deployment: Docker-based multi-container architecture

---

## Key Features

- Natural language querying
- ML-based Named Entity Recognition using spaCy
- Detection of GPE (cities), DATE, PERSON, and numeric entities
- Schema-aware field validation
- Safe read-only execution guard
- Aggregation and count support
- Dynamic filtering and sorting
- Structured explanation panel for transparency
- Clean Mongo-inspired user interface
- Loading indicators and UX feedback
- Dockerized microservice deployment

---

## Technology Stack

### Frontend
- React
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB Node Driver

### NLP Service
- Python
- FastAPI
- spaCy (en_core_web_sm model)

### Database
- MongoDB Atlas

### Deployment
- Docker
- Docker Compose

---

## How It Works

1. User submits a natural language query.
2. Backend forwards query to the spaCy NLP service.
3. NLP service extracts entities and numeric values.
4. Backend:
   - Detects intent (find, count, aggregate)
   - Validates fields against MongoDB schema
   - Applies safe filtering logic
   - Blocks destructive operations
5. Query executes against MongoDB Atlas.
6. Results and explanation are returned to frontend.
7. UI displays summary, explanation, and structured data table.

---

## Setup Instructions

### Prerequisites

- Docker Desktop installed and running
- Node.js (for frontend development)

---

### Step 1: Clone Repository

```

git clone [https://github.com/YOUR_USERNAME/mongoai-nlp-query-engine.git](https://github.com/YOUR_USERNAME/mongoai-nlp-query-engine.git)
cd mongoai-nlp-query-engine

```

---

### Step 2: Configure MongoDB Atlas URI

Open `docker-compose.yml` and replace:

```

MONGO_URI=your_mongodb_connection_string_here

```

with your actual MongoDB Atlas connection string.

---

### Step 3: Start Backend and NLP Services

From project root:

```

docker compose up --build

```

This will start:

- Backend service (port 5000)
- NLP service (port 8000)

---

### Step 4: Start Frontend

Open a new terminal:

```

cd frontend
npm install
npm run dev

```

Open the URL shown in the terminal (typically http://localhost:5173).

---

## Example Queries

- Show all users
- Show users from Mumbai
- How many users from Delhi
- Show users with purchaseAmount greater than 500
- Show users who joined after July

---

## Safety Mechanisms

- Blocks destructive keywords (delete, drop, update, insert)
- Read-only query execution
- Schema validation before filter application
- Controlled aggregation logic
- Error handling for NLP service failures

---

## Limitations

- Supports read-only operations only
- Date parsing is simplified (month-level handling)
- Designed primarily for structured collections
- Currently supports single-collection querying

---

## Future Scope

- Role-based access control (RBAC)
- Write/update operations with permission control
- Multi-collection joins
- Advanced semantic query understanding
- Query history persistence
- Deployment to cloud platforms (Render/Vercel)

---

## Project Status

This project is a fully functional, Dockerized multi-service Natural Language Interface for MongoDB designed for hackathon submission and extensibility into production-level systems.

---
Create a `backend/.env` :
- `MONGO_URI`: Your MONGO_URI KEY






# Use official Python image
FROM python:3.10

# Set working directory
WORKDIR /app

# Copy all service files
COPY . .

# Install required packages
RUN pip install --no-cache-dir fastapi uvicorn spacy

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Expose NLP service port
EXPOSE 8000

# Start FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
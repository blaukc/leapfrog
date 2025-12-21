FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install minimal build deps in case wheels are not available for some packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ ./

EXPOSE 8000

# Run the FastAPI app with Uvicorn on the container port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

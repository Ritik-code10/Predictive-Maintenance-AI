
# 1. Use Python as the base environment
FROM python:3.13-slim

# 2. Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set the working directory
WORKDIR /app

# 4. Copy dependency file
COPY requirements.txt .

# 5. Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY models/ ./models/

# 7. Expose application port
EXPOSE 8000

# 8. Start FastAPI server
CMD ["sh", "-c", "uvicorn main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8000}"]

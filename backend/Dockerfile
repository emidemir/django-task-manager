# Use official lightweight Python image
FROM python:3.14.4-slim

# Set environment variables
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing .pyc files to disk
# PYTHONUNBUFFERED: Prevents Python from buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies (needed for Postgres and other C-extensions)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Install Gunicorn (Production server for Django)
RUN pip install gunicorn

# Copy the rest of the Django project code into the container
COPY . .

# Expose port 8000 (Internal Docker network only)
EXPOSE 8000

# The command to run when the container starts.
# IMPORTANT: Replace "myproject" with the actual name of your main Django folder 
# (the folder that contains settings.py and wsgi.py)
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
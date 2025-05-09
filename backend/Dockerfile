# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install pipenv
RUN pip install --no-cache-dir pipenv

# Copy the requirements.txt file into the container
COPY requirements.txt /app/

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/

# Generate a safe SECRET_KEY if not already in .env
RUN if ! grep -q SECRET_KEY .env; then \
      echo "SECRET_KEY=\"$(python -c 'import random; print(''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=50)))')\"" >> .env; \
    fi

# Expose port 8000 for the Django app
EXPOSE 8000

# Run the application (Django runserver for dev)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

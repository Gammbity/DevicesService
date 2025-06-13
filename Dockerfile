FROM python:3.10-slim

# Kerakli joyga ko‘chib o‘tamiz
WORKDIR /app

# Tizim kutubxonalarini o‘rnatamiz
RUN apt-get update && apt-get install -y \
    pkg-config \
    libdbus-1-dev \
    python3-dev \
    build-essential \
    cmake \
    libglib2.0-dev \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt ni to‘g‘ri joyga nusxalaymiz
COPY requirements.txt .

# Pipni yangilaymiz va kutubxonalarni o‘rnatamiz
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Barcha fayllarni /app ichiga nusxalaymiz
COPY . .

# Statik fayllarni yig‘amiz
RUN python backend/manage.py collectstatic --noinput

# PYTHONPATH'ni o‘rnatamiz
ENV PYTHONPATH=/app/backend


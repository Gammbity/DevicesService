FROM python:3.10-slim

WORKDIR /app/backend

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

COPY requirements.txt /app/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app/

RUN python backend/manage.py collectstatic --noinput

ENV PYTHONPATH=/app/backend

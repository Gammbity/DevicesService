FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    bpfcc-tools \
    libbcc-examples \
    libbcc-dev \
    python3-bcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app/

RUN python backend/manage.py collectstatic --noinput

ENV PYTHONPATH=/app/backend

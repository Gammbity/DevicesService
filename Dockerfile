FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY ./backend /app/backend

ENV PYTHONPATH=/app/backend

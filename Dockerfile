FROM python:3.10-slim

WORKDIR /app/backend

COPY ./backend /app/backend

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

ENV PYTHONPATH=/app/backend


from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator

@shared_task
def send_welcome_email(to_email):
    subject = "Welcome!"
    message = "Thanks for registering."
    from_email = "abduboriyabdusamadov66@gmail.com"

    send_mail(subject, message, from_email, [to_email])
    return f"Email sent to {to_email}"

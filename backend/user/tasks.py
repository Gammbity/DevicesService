from celery import shared_task
from django.core.mail import send_mail
from django.core import signing


# ✅ Token yaratish (email yashirin holatda)
def generate_token(email):
    return signing.dumps({'email': email})

@shared_task
def send_welcome_email(to_email):
    try: 
        link = f"http://13.49.213.104:8000/api/v1/user/verify/{generate_token(to_email)}"
        from_email = "abduboriyabdusamadov66@gmail.com"
        email = to_email
        send_mail(f"Hi {email} this is your profile link!",link, from_email, [email])
        return f"Email sent to {email}"
    except Exception as e:
        return f"Error sending email: {str(e)}"
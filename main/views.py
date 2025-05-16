from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _


from . import serializers
from . import models
from . import tasks
User = get_user_model()
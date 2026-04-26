from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # Make email unique and required
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)  # For user avatars

    USERNAME_FIELD = 'email'  # Use email for login instead of username
    REQUIRED_FIELDS = ['username']  # Still require username for compatibility

    def __str__(self):
        return self.email
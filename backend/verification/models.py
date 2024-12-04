from django.db import models

class UserVerification(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    institution_name = models.CharField(max_length=100)
    institution_address = models.TextField()
    role = models.CharField(max_length=50)
    is_verified = models.BooleanField(default=False)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

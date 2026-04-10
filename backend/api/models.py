from django.contrib.auth.models import User
from django.db import models

class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    pinned = models.BooleanField(default=False)
    folder = models.CharField(max_length=255, null=True, blank=True)
class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10)
    text = models.TextField()
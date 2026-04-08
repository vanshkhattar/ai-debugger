from django.db import models

class Chat(models.Model):
    title = models.CharField(max_length=255)

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10)
    text = models.TextField()
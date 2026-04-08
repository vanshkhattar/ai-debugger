from rest_framework import serializers
from .models import Chat, Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["role", "text"]

class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True)

    class Meta:
        model = Chat
        fields = ["id", "title", "messages"]

    def create(self, validated_data):
        messages_data = validated_data.pop("messages")
        chat = Chat.objects.create(**validated_data)

        for msg in messages_data:
            Message.objects.create(chat=chat, **msg)

        return chat
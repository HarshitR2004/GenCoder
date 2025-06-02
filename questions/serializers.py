from rest_framework import serializers
from .models import Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

    def create(self, validated_data):
        question = validated_data.pop('question', None)
        # logic to save the question into s3 or any other storage
        return Question.objects.create(**validated_data)

    def update(self, instance, validated_data):
        question = validated_data.pop('question', None)
        # logic to update the question in s3 or any other storage
        return super().update(instance, validated_data)

    def delete(self,instance, validated_data=None):
        # logic to delete the question from s3 or any other storage
        question = instance.question
        instance.delete()
        return True
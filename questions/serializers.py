from rest_framework import serializers
from .models import Question, Language, Topic

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'



class TopicSerializer(serializers.ModelSerializer):
    # Add a custom field to return the display name
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = '__all__'
    
    def get_name(self, obj):
        """Return the display name instead of the raw topic key"""
        return obj.get_topic_display()
    
    def to_representation(self, instance):
        """Custom representation to ensure display name is included"""
        data = super().to_representation(instance)
        # Override the topic field to show display name
        data['name'] = instance.get_topic_display()
        return data


class QuestionSerializer(serializers.ModelSerializer):
    # Nested serializers to include full topic and language info
    topics = TopicSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    
    # For form submissions - accept arrays of IDs
    topic_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        required=False
    )
    language_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        required=False
    )
    
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'question_s3_key')
    
    def create(self, validated_data):
        """Handle creation with topic and language relationships"""
        topic_ids = validated_data.pop('topic_ids', [])
        language_ids = validated_data.pop('language_ids', [])
        
        # Create the question
        question = Question.objects.create(**validated_data)
        
        # Set relationships
        if topic_ids:
            question.topics.set(topic_ids)
        if language_ids:
            question.languages.set(language_ids)
            
        return question
    
    def update(self, instance, validated_data):
        """Handle updates with topic and language relationships"""
        topic_ids = validated_data.pop('topic_ids', None)
        language_ids = validated_data.pop('language_ids', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update relationships if provided
        if topic_ids is not None:
            instance.topics.set(topic_ids)
        if language_ids is not None:
            instance.languages.set(language_ids)
            
        return instance

        


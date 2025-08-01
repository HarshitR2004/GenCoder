# Generated by Django 5.2.1 on 2025-06-07 12:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0005_alter_question_options_remove_question_question_path_and_more'),
        ('testcase', '0003_rename_input_testcase_input_path_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='testcase',
            name='input_path',
        ),
        migrations.RemoveField(
            model_name='testcase',
            name='output_path',
        ),
        migrations.AddField(
            model_name='testcase',
            name='input_s3_key',
            field=models.CharField(blank=True, help_text='S3 key for input file', max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='testcase',
            name='is_example',
            field=models.BooleanField(default=False, help_text='Whether this is an example test case'),
        ),
        migrations.AddField(
            model_name='testcase',
            name='is_hidden',
            field=models.BooleanField(default=False, help_text='Whether this test case is hidden from users'),
        ),
        migrations.AddField(
            model_name='testcase',
            name='output_s3_key',
            field=models.CharField(blank=True, help_text='S3 key for output file', max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='testcase',
            name='question',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='test_cases', to='questions.question'),
            preserve_default=False,
        ),
    ]

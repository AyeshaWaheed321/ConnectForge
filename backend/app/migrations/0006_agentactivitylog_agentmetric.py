# Generated by Django 5.2.1 on 2025-05-12 08:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_alter_llmconfig_max_tokens_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AgentActivityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('agent_created', 'Agent Created'), ('agent_deleted', 'Agent Deleted'), ('agent_modified', 'Agent Modified'), ('chat_started', 'Chat Started'), ('chat_ended', 'Chat Ended'), ('chat_deleted', 'Chat Deleted'), ('error_occurred', 'Error Occurred')], max_length=50)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('metadata', models.JSONField(blank=True, null=True)),
                ('agent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='app.agentconfig')),
            ],
        ),
        migrations.CreateModel(
            name='AgentMetric',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(auto_now_add=True)),
                ('total_requests', models.PositiveIntegerField(default=0)),
                ('total_success', models.PositiveIntegerField(default=0)),
                ('total_failures', models.PositiveIntegerField(default=0)),
                ('total_response_time_ms', models.BigIntegerField(default=0)),
                ('agent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='app.agentconfig')),
            ],
        ),
    ]

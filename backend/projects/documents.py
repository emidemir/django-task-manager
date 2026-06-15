# projects/documents.py

from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Task

@registry.register_document
class TaskDocument(Document):
    # Map foreign keys so we can search by project name or assignee name
    project = fields.ObjectField(properties={
        'id': fields.KeywordField(),
        'name': fields.TextField(),
    })
    
    assigned_to = fields.ObjectField(properties={
        'id': fields.KeywordField(),
        'username': fields.TextField(),
        'first_name': fields.TextField(),
        'last_name': fields.TextField(),
    })

    class Index:
        name = 'tasks'
        settings = {'number_of_shards': 1, 'number_of_replicas': 0}

    class Django:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
        ]
from django_elasticsearch_dsl import Document, fields # Import 'fields'
from django_elasticsearch_dsl.registries import registry
from django.contrib.auth import get_user_model

User = get_user_model()

@registry.register_document
class UserDocument(Document):
    # 1. Explicitly define email as a KeywordField for EXACT matching
    email = fields.KeywordField()

    class Index:
        name = 'users'
        settings = {'number_of_shards': 1, 'number_of_replicas': 0}

    class Django:
        model = User
        fields = [
            'id',
            'username',
            # 2. Remove 'email' from this list since we defined it above!
            'first_name',
            'last_name',
        ]
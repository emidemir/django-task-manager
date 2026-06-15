from pathlib import Path
from dotenv import load_dotenv
import os
from datetime import timedelta


load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    # Daphne must be listed before django.contrib.staticfiles in INSTALLED_APPS.
    'daphne', #https://channels.readthedocs.io/en/latest/installation.html

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Packages
    'rest_framework', # https://www.django-rest-framework.org/
    'rest_framework_simplejwt', #https://django-rest-framework-simplejwt.readthedocs.io/en/latest/getting_started.html#
    'corsheaders', # https://pypi.org/project/django-cors-headers/
    'storages', #https://pypi.org/project/django-storages/ 
    'rest_framework_simplejwt.token_blacklist',
    'django_elasticsearch_dsl', #https://django-elasticsearch-dsl.readthedocs.io/en/latest/
    
    # Django apps
    'projects',
    'notifications',
    'users',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    # {
    #     'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    # },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'



AUTH_USER_MODEL = 'users.User'



# ========================= DRF =========================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        # 'rest_framework.permissions.IsAuthenticated',
    ),
}

# ========================= JWT =========================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": os.environ.get('SECRET_KEY'),
}

# ========================= ASGI =========================
ASGI_APPLICATION = "config.asgi.application"
# pip install channels-redis
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}

# ========================= CORS =========================
CORS_ALLOW_ALL_ORIGINS = True # Only for development


# ========================= DB =========================
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
# pip install psycopg2-binary
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME':os.environ.get('POSTGRES_DB_NAME'),
        'USER':os.environ.get('POSTGRES_DB_USER'),
        'PASSWORD':os.environ.get('POSTGRES_DB_PASSWORD'),
        'HOST':os.environ.get('POSTGRES_DB_HOST'), # Docker service name
        'PORT':os.environ.get('POSTGRES_DB_PORT'),
    }
}

# ========================= MINIO =========================
# 1. Credentials
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
# 2. The Bucket — create this in the MinIO console beforehand
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
# 3. Endpoint — overrides the default AWS URL and points boto3 at your MinIO instance
AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL')  # e.g. http://127.0.0.1:9000
# 4. SSL — set False for local HTTP development; True in production with HTTPS
AWS_S3_USE_SSL = False
# 5. Don't add authentication query params to every image URL
#    (Safe to disable when your bucket policy is set to public read)
AWS_QUERYSTRING_AUTH = False
# 6. Prevent files with the same name from overwriting each other
AWS_S3_FILE_OVERWRITE = False
# 7. Build the custom domain so generated URLs point at MinIO, not AWS
#    Results in something like: 127.0.0.1:9000/products
AWS_S3_CUSTOM_DOMAIN = f"{AWS_S3_ENDPOINT_URL.split('//')[1]}/{AWS_STORAGE_BUCKET_NAME}"
# 8. Ensure generated URLs use http in local dev
AWS_S3_URL_PROTOCOL = 'http:'
# 9. Route Django's default file storage through S3/MinIO
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# ========================= ELASTICSEARCH =========================
# https://github.com/emidemir/django-ecommerce-backend/tree/main#2-elasticsearch-text-search
# settings.py
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': 'http://localhost:9200',
        # 'basic_auth': ('username', 'password'),  # ← changed from http_auth
    }
}
from pathlib import Path


# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent


# Development settings
SECRET_KEY = "dsa-lab-dev-key"
DEBUG = True
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


# Applications and middleware
INSTALLED_APPS = [
    "django.contrib.staticfiles",
    "visualizer",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "dsa_lab.urls"
WSGI_APPLICATION = "dsa_lab.wsgi.application"


# Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [],
        },
    }
]


# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# Static files
STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]


# Model defaults
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

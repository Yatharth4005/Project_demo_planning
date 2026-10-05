import os

from django.core.asgi import get_asgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "casting_optimizer.settings")
application = get_asgi_application()

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from planner.models import RuleMaster


class Command(BaseCommand):
    help = "Create a local demo user and starter SPM rules."

    def handle(self, *args, **options):
        User = get_user_model()
        admin_user, _ = User.objects.get_or_create(
            username="ADMIN",
            defaults={
                "email": "admin@example.com",
                "first_name": "Admin",
                "last_name": "User",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("ADMIN@1234")
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

        user, created = User.objects.get_or_create(
            username="planner",
            defaults={
                "email": "planner@example.com",
                "first_name": "Arjun",
                "last_name": "Kumar",
            },
        )
        if created:
            user.set_password("ChangeMe123!")
            user.save()
        rules = [
            ("Rail 60E1", "R260", 128, 11.8, 93.2),
            ("Channel UPN 200", "S355J2", 120, 11.5, 92.4),
            ("Crane Rail A100", "R350HT", 126, 11.8, 91.8),
        ]
        for section, grade, batch, length, target in rules:
            RuleMaster.objects.get_or_create(
                section=section,
                grade=grade,
                defaults={
                    "lfa_batch_tonnes": batch,
                    "billet_length_m": length,
                    "target_yield_percent": target,
                },
            )
        self.stdout.write(self.style.SUCCESS("Demo data is ready."))

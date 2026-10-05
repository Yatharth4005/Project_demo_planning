import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name="RuleMaster",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("section", models.CharField(max_length=120)),
                ("grade", models.CharField(max_length=80)),
                ("lfa_batch_tonnes", models.DecimalField(decimal_places=2, default=128, max_digits=8)),
                ("billet_length_m", models.DecimalField(decimal_places=2, default=11.8, max_digits=6)),
                ("max_heats_per_batch", models.PositiveSmallIntegerField(default=8)),
                ("target_yield_percent", models.DecimalField(decimal_places=2, default=92, max_digits=5)),
                ("is_active", models.BooleanField(default=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["section", "grade"]},
        ),
        migrations.CreateModel(
            name="BTRUpload",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("workbook", models.FileField(upload_to="btr/%Y/%m/", validators=[django.core.validators.FileExtensionValidator(["xlsx", "xls", "xlsm"])])),
                ("original_name", models.CharField(max_length=255)),
                ("status", models.CharField(choices=[("uploaded", "Uploaded"), ("validated", "Validated"), ("failed", "Failed")], default="uploaded", max_length=12)),
                ("row_count", models.PositiveIntegerField(default=0)),
                ("total_demand_tonnes", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("validation_errors", models.JSONField(blank=True, default=list)),
                ("normalized_orders", models.JSONField(blank=True, default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("uploaded_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="CampaignPlan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("section", models.CharField(max_length=120)),
                ("grade", models.CharField(max_length=80)),
                ("strategy", models.CharField(choices=[("yield", "Yield optimized"), ("delivery", "Delivery priority")], default="yield", max_length=12)),
                ("demand_tonnes", models.DecimalField(decimal_places=2, max_digits=12)),
                ("order_count", models.PositiveIntegerField()),
                ("sequence", models.JSONField(default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("btr", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="campaigns", to="planner.btrupload")),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="CastingPlan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("plan_number", models.CharField(max_length=30, unique=True)),
                ("total_cast_tonnes", models.DecimalField(decimal_places=2, max_digits=12)),
                ("expected_yield_percent", models.DecimalField(decimal_places=2, max_digits=5)),
                ("heat_sequence", models.JSONField(default=list)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("review", "In review"), ("complete", "Completed")], default="draft", max_length=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("campaign", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="casting_plan", to="planner.campaignplan")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddConstraint(
            model_name="rulemaster",
            constraint=models.UniqueConstraint(fields=("section", "grade"), name="unique_section_grade_rule"),
        ),
    ]

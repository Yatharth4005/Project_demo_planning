from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator
from django.db import models


User = get_user_model()


class RuleMaster(models.Model):
    section = models.CharField(max_length=120)
    grade = models.CharField(max_length=80)
    lfa_batch_tonnes = models.DecimalField(max_digits=8, decimal_places=2, default=128)
    billet_length_m = models.DecimalField(max_digits=6, decimal_places=2, default=11.8)
    max_heats_per_batch = models.PositiveSmallIntegerField(default=8)
    target_yield_percent = models.DecimalField(max_digits=5, decimal_places=2, default=92)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["section", "grade"], name="unique_section_grade_rule"
            )
        ]
        ordering = ["section", "grade"]

    def __str__(self):
        return f"{self.section} · {self.grade}"


class BTRUpload(models.Model):
    class Status(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        VALIDATED = "validated", "Validated"
        FAILED = "failed", "Failed"

    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT)
    workbook = models.FileField(
        upload_to="btr/%Y/%m/",
        validators=[FileExtensionValidator(["xlsx", "xls", "xlsm"])],
    )
    original_name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.UPLOADED
    )
    row_count = models.PositiveIntegerField(default=0)
    total_demand_tonnes = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )
    validation_errors = models.JSONField(default=list, blank=True)
    normalized_orders = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.original_name


class CampaignPlan(models.Model):
    class Strategy(models.TextChoices):
        YIELD = "yield", "Yield optimized"
        DELIVERY = "delivery", "Delivery priority"

    btr = models.ForeignKey(
        BTRUpload, on_delete=models.PROTECT, related_name="campaigns"
    )
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    section = models.CharField(max_length=120)
    grade = models.CharField(max_length=80)
    strategy = models.CharField(
        max_length=12, choices=Strategy.choices, default=Strategy.YIELD
    )
    demand_tonnes = models.DecimalField(max_digits=12, decimal_places=2)
    order_count = models.PositiveIntegerField()
    sequence = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.section} / {self.grade}"


class CastingPlan(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        REVIEW = "review", "In review"
        COMPLETE = "complete", "Completed"

    campaign = models.OneToOneField(
        CampaignPlan, on_delete=models.CASCADE, related_name="casting_plan"
    )
    plan_number = models.CharField(max_length=30, unique=True)
    total_cast_tonnes = models.DecimalField(max_digits=12, decimal_places=2)
    expected_yield_percent = models.DecimalField(max_digits=5, decimal_places=2)
    heat_sequence = models.JSONField(default=list)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.plan_number

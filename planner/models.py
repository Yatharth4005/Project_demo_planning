from django.contrib.auth import get_user_model
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


class SCADAPLCTag(models.Model):
    class DataType(models.TextChoices):
        REAL = "REAL", "REAL (32-bit Float)"
        DINT = "DINT", "DINT (32-bit Int)"
        BOOL = "BOOL", "BOOL (Boolean)"
        WORD = "WORD", "WORD (16-bit Hex)"

    class Quality(models.TextChoices):
        GOOD = "GOOD", "Good Signal"
        BAD = "BAD", "Bad Signal"
        UNCERTAIN = "UNCERTAIN", "Uncertain"

    address = models.CharField(max_length=60, unique=True, help_text="e.g. DB100.DBD0")
    name = models.CharField(max_length=120)
    data_type = models.CharField(max_length=10, choices=DataType.choices, default=DataType.REAL)
    value = models.CharField(max_length=100)
    unit = models.CharField(max_length=20, blank=True, default="-")
    quality = models.CharField(max_length=12, choices=Quality.choices, default=Quality.GOOD)
    scan_ms = models.PositiveIntegerField(default=50)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["address"]

    def __str__(self):
        return f"{self.address} - {self.name}"


class SCADAAlarmLog(models.Model):
    class Severity(models.TextChoices):
        CRITICAL = "CRITICAL", "Critical"
        WARNING = "WARNING", "Warning"
        INFO = "INFO", "Information"

    alarm_id = models.CharField(max_length=30, unique=True)
    tag = models.CharField(max_length=120)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.WARNING)
    message = models.TextField()
    location = models.CharField(max_length=120, default="Mill Line")
    acknowledged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.severity}] {self.alarm_id}: {self.message[:40]}"


class SCADATelemetrySnapshot(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    mill_speed_m_s = models.FloatField(default=14.2)
    shift_tonnage = models.FloatField(default=542.8)
    power_kwh_ton = models.FloatField(default=182.4)
    oee_overall = models.FloatField(default=94.6)
    oee_availability = models.FloatField(default=97.2)
    oee_performance = models.FloatField(default=98.1)
    oee_quality = models.FloatField(default=99.3)
    furnace_zone1_c = models.FloatField(default=1184.0)
    furnace_zone2_c = models.FloatField(default=1241.0)
    furnace_zone3_c = models.FloatField(default=1258.0)
    caster_tundish_c = models.FloatField(default=1542.0)
    caster_speed_m_min = models.FloatField(default=14.5)
    stands_telemetry = models.JSONField(default=dict)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Snapshot at {self.timestamp:%Y-%m-%d %H:%M:%S} - Mill Speed: {self.mill_speed_m_s} m/s"


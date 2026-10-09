from django.contrib import admin
from .models import RuleMaster, SCADAPLCTag, SCADAAlarmLog, SCADATelemetrySnapshot


@admin.register(RuleMaster)
class RuleMasterAdmin(admin.ModelAdmin):
    list_display = (
        "section",
        "grade",
        "lfa_batch_tonnes",
        "billet_length_m",
        "target_yield_percent",
        "is_active",
    )
    list_filter = ("is_active", "grade")
    search_fields = ("section", "grade")


@admin.register(SCADAPLCTag)
class SCADAPLCTagAdmin(admin.ModelAdmin):
    list_display = ("address", "name", "data_type", "value", "unit", "quality", "scan_ms")
    list_filter = ("quality", "data_type")
    search_fields = ("address", "name")


@admin.register(SCADAAlarmLog)
class SCADAAlarmLogAdmin(admin.ModelAdmin):
    list_display = ("alarm_id", "severity", "tag", "location", "acknowledged", "created_at")
    list_filter = ("severity", "acknowledged")
    search_fields = ("alarm_id", "tag", "message")


@admin.register(SCADATelemetrySnapshot)
class SCADATelemetrySnapshotAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "mill_speed_m_s", "shift_tonnage", "power_kwh_ton", "oee_overall")
    ordering = ("-timestamp",)


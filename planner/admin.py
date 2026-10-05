from django.contrib import admin

from .models import BTRUpload, CampaignPlan, CastingPlan, RuleMaster


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


admin.site.register(BTRUpload)
admin.site.register(CampaignPlan)
admin.site.register(CastingPlan)

from django.urls import path
from . import views

urlpatterns = [
    path("login/", views.PlannerLoginView.as_view(), name="login"),
    path("logout/", views.PlannerLogoutView.as_view(), name="logout"),
    path("", views.dashboard, name="dashboard"),
    path("api/scada/live/", views.scada_live_api, name="scada_live_api"),
    path("api/scada/alarms/", views.scada_alarms_api, name="scada_alarms_api"),
    path("api/scada/alarms/ack/", views.scada_alarm_ack_api, name="scada_alarm_ack_api"),
    path("api/scada/tags/", views.scada_tags_api, name="scada_tags_api"),
    path("api/scada/reports/", views.scada_reports_api, name="scada_reports_api"),
]



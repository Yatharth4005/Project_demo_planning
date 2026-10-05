from django.urls import path

from . import views


urlpatterns = [
    path("login/", views.PlannerLoginView.as_view(), name="login"),
    path("logout/", views.PlannerLogoutView.as_view(), name="logout"),
    path("", views.dashboard, name="dashboard"),
    path("btr/upload/", views.btr_upload, name="btr_upload"),
    path("campaigns/", views.campaign_create, name="campaign_create"),
    path(
        "campaigns/from/<int:upload_id>/",
        views.campaign_create,
        name="campaign_create",
    ),
    path("casting/", views.casting_list, name="casting_list"),
    path("casting/<int:plan_id>/", views.casting_detail, name="casting_detail"),
    path("casting/<int:plan_id>/export/", views.export_plan, name="export_plan"),
]

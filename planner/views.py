from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, LogoutView
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404, redirect, render

from .forms import BTRUploadForm, CampaignForm
from .models import BTRUpload, CastingPlan, RuleMaster
from .services import (
    campaign_workbook,
    create_casting_plan,
    material_summary,
    materials_for,
    parse_btr,
)


class PlannerLoginView(LoginView):
    template_name = "planner/login.html"
    redirect_authenticated_user = True


class PlannerLogoutView(LogoutView):
    pass


@login_required
def dashboard(request):
    plans = CastingPlan.objects.select_related("campaign")[:5]
    uploads = BTRUpload.objects.filter(
        uploaded_by=request.user, status=BTRUpload.Status.VALIDATED
    )
    open_demand = sum(float(upload.total_demand_tonnes) for upload in uploads[:10])
    average_yield = (
        sum(float(plan.expected_yield_percent) for plan in plans) / len(plans)
        if plans
        else 0
    )
    return render(
        request,
        "planner/dashboard.html",
        {
            "active_page": "dashboard",
            "plans": plans,
            "open_demand": open_demand,
            "average_yield": average_yield,
            "campaign_count": CastingPlan.objects.filter(
                status__in=[CastingPlan.Status.DRAFT, CastingPlan.Status.REVIEW]
            ).count(),
        },
    )


@login_required
def btr_upload(request):
    form = BTRUploadForm(request.POST or None, request.FILES or None)
    if request.method == "POST" and form.is_valid():
        file = form.cleaned_data["workbook"]
        upload = BTRUpload.objects.create(
            uploaded_by=request.user,
            workbook=file,
            original_name=file.name,
        )
        parse_btr(upload)
        if upload.status == BTRUpload.Status.FAILED:
            for error in upload.validation_errors:
                messages.error(request, error)
        else:
            messages.success(
                request,
                f"{upload.row_count} demand rows validated successfully.",
            )
            return redirect("campaign_create", upload_id=upload.pk)
    return render(
        request,
        "planner/btr_upload.html",
        {"active_page": "btr", "form": form},
    )


@login_required
def campaign_create(request, upload_id=None):
    uploads = BTRUpload.objects.filter(
        uploaded_by=request.user, status=BTRUpload.Status.VALIDATED
    )
    upload = get_object_or_404(uploads, pk=upload_id) if upload_id else uploads.first()
    if not upload:
        messages.info(request, "Upload and validate a BTR workbook first.")
        return redirect("btr_upload")

    materials = materials_for(upload)
    form = CampaignForm(request.POST or request.GET or None, materials=materials)
    selected = form.data.get("material") if form.is_bound else (
        f"{materials[0][0]}|||{materials[0][1]}" if materials else ""
    )
    section, grade = selected.split("|||", 1) if "|||" in selected else ("", "")
    summary = material_summary(upload, section, grade) if section else None
    rule = RuleMaster.objects.filter(section=section, grade=grade).first()

    if request.method == "POST" and form.is_valid():
        section, grade = form.cleaned_data["material"].split("|||", 1)
        plan = create_casting_plan(
            upload, request.user, section, grade, form.cleaned_data["strategy"]
        )
        messages.success(request, f"Casting plan {plan.plan_number} generated.")
        return redirect("casting_detail", plan_id=plan.pk)

    return render(
        request,
        "planner/campaign.html",
        {
            "active_page": "campaigns",
            "upload": upload,
            "form": form,
            "summary": summary,
            "rule": rule,
            "section": section,
            "grade": grade,
        },
    )


@login_required
def casting_list(request):
    plans = CastingPlan.objects.select_related("campaign", "campaign__created_by")
    return render(
        request,
        "planner/casting_list.html",
        {"active_page": "casting", "plans": plans},
    )


@login_required
def casting_detail(request, plan_id):
    plan = get_object_or_404(
        CastingPlan.objects.select_related("campaign"), pk=plan_id
    )
    return render(
        request,
        "planner/casting_detail.html",
        {"active_page": "casting", "plan": plan},
    )


@login_required
def export_plan(request, plan_id):
    plan = get_object_or_404(CastingPlan, pk=plan_id)
    output = campaign_workbook(plan)
    return FileResponse(
        output,
        as_attachment=True,
        filename=f"{plan.plan_number}-rolling-plan.xlsx",
        content_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
    )

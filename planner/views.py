import random
import time
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, LogoutView
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import SCADAAlarmLog, SCADAPLCTag, SCADATelemetrySnapshot


class PlannerLoginView(LoginView):
    template_name = "planner/login.html"
    redirect_authenticated_user = True


class PlannerLogoutView(LogoutView):
    pass


def dashboard(request):
    latest_snapshot = SCADATelemetrySnapshot.objects.first()
    active_alarms = SCADAAlarmLog.objects.filter(acknowledged=False).count()
    total_tags = SCADAPLCTag.objects.count()
    
    return render(
        request,
        "planner/dashboard.html",
        {
            "active_page": "dashboard",
            "snapshot": latest_snapshot,
            "active_alarms": active_alarms,
            "total_tags": total_tags,
        },
    )


def scada_live_api(request):
    now = time.time()
    mill_speed = round(14.2 + random.uniform(-0.3, 0.3), 2)
    shift_tonnage = round(542.8 + (now % 100) * 0.1, 1)
    power_kwh = round(182.4 + random.uniform(-2, 2), 1)
    
    stands = [
        {
            "id": "R1",
            "name": "Roughing Stand 1",
            "type": "roughing",
            "rpm": round(215 + random.uniform(-3, 3), 1),
            "loadPercent": round(78 + random.uniform(-4, 4), 1),
            "torqueKnm": round(420 + random.uniform(-10, 10), 1),
            "rollTempC": round(642 + random.uniform(-8, 8), 1),
            "vibMmS": round(1.8 + random.uniform(-0.2, 0.2), 2),
            "hydraulicBar": 185,
            "rollGapMm": 42.5,
            "status": "NORMAL",
        },
        {
            "id": "R2",
            "name": "Roughing Stand 2",
            "type": "roughing",
            "rpm": round(284 + random.uniform(-4, 4), 1),
            "loadPercent": round(82 + random.uniform(-3, 3), 1),
            "torqueKnm": round(395 + random.uniform(-12, 12), 1),
            "rollTempC": round(658 + random.uniform(-7, 7), 1),
            "vibMmS": round(2.1 + random.uniform(-0.3, 0.3), 2),
            "hydraulicBar": 188,
            "rollGapMm": 34.0,
            "status": "NORMAL",
        },
        {
            "id": "I1",
            "name": "Intermediate Stand 1",
            "type": "intermediate",
            "rpm": round(452 + random.uniform(-5, 5), 1),
            "loadPercent": round(74 + random.uniform(-5, 5), 1),
            "torqueKnm": round(285 + random.uniform(-8, 8), 1),
            "rollTempC": round(682 + random.uniform(-6, 6), 1),
            "vibMmS": round(1.4 + random.uniform(-0.1, 0.1), 2),
            "hydraulicBar": 192,
            "rollGapMm": 24.8,
            "status": "NORMAL",
        },
        {
            "id": "I4",
            "name": "Intermediate Stand 4",
            "type": "intermediate",
            "rpm": round(710 + random.uniform(-6, 6), 1),
            "loadPercent": round(81 + random.uniform(-4, 4), 1),
            "torqueKnm": round(220 + random.uniform(-6, 6), 1),
            "rollTempC": round(705 + random.uniform(-5, 5), 1),
            "vibMmS": round(1.7 + random.uniform(-0.2, 0.2), 2),
            "hydraulicBar": 172,
            "rollGapMm": 12.8,
            "status": "WARNING",
        },
        {
            "id": "F1",
            "name": "Universal Finishing 1",
            "type": "finishing",
            "rpm": round(895 + random.uniform(-10, 10), 1),
            "loadPercent": round(88 + random.uniform(-3, 3), 1),
            "torqueKnm": round(195 + random.uniform(-5, 5), 1),
            "rollTempC": round(712 + random.uniform(-5, 5), 1),
            "vibMmS": round(1.2 + random.uniform(-0.1, 0.1), 2),
            "hydraulicBar": 195,
            "rollGapMm": 9.4,
            "status": "NORMAL",
        },
    ]

    data = {
        "status": "ONLINE",
        "protocol": "OPC UA / Modbus TCP",
        "plc_id": "SIEMENS-S7-1500-SPM01",
        "latency_ms": round(random.uniform(8, 15), 1),
        "timestamp": int(now),
        "mill_speed_m_s": mill_speed,
        "shift_tonnage": shift_tonnage,
        "target_tonnage": 650.0,
        "oee": {
            "overall": round(94.6 + random.uniform(-0.4, 0.4), 1),
            "availability": 97.2,
            "performance": 98.1,
            "quality": 99.3,
        },
        "power_kwh_ton": power_kwh,
        "furnace": {
            "zone1": round(1184 + random.uniform(-4, 4), 1),
            "zone2": round(1241 + random.uniform(-4, 4), 1),
            "zone3": round(1258 + random.uniform(-5, 5), 1),
            "billetCount": 42,
            "gasPressure": round(48.5 + random.uniform(-0.4, 0.4), 1),
            "airFuelRatio": 1.08,
            "pusherCycles": 1840,
        },
        "caster": {
            "tundishTemp": round(1542 + random.uniform(-3, 3), 1),
            "castingSpeed": round(1.45 + random.uniform(-0.02, 0.02), 2),
            "moldOscillationHz": 2.8,
            "waterFlowLmin": round(1420 + random.uniform(-10, 10), 1),
            "strand1Status": "CASTING",
            "strand2Status": "CASTING",
            "steelGrade": "R260 / Rail 60E1",
            "ladleHeatNumber": "LFA-22058",
        },
        "stands": stands,
        "active_alarms_count": SCADAAlarmLog.objects.filter(acknowledged=False).count(),
    }
    return JsonResponse(data)


def scada_alarms_api(request):
    db_alarms = list(SCADAAlarmLog.objects.all().values(
        "alarm_id", "created_at", "tag", "severity", "message", "location", "acknowledged"
    )[:20])
    
    if not db_alarms:
        db_alarms = [
            {
                "alarm_id": "ALM-902",
                "created_at": "19:01:42",
                "tag": "SPM_PLC_01.Stand_I4.HydraulicBar",
                "severity": "WARNING",
                "message": "Stand I4 Hydraulic pressure dropped below nominal setpoint (172 Bar vs 190 Bar target)",
                "location": "Intermediate Stand 4",
                "acknowledged": False,
            },
            {
                "alarm_id": "ALM-899",
                "created_at": "18:44:10",
                "tag": "SPM_PLC_01.Furnace.Zone2_Temp",
                "severity": "INFO",
                "message": "Reheating Furnace Zone 2 steady-state thermal lock achieved at 1241°C",
                "location": "Reheating Furnace",
                "acknowledged": True,
            },
        ]
    return JsonResponse({"alarms": db_alarms})


@csrf_exempt
def scada_alarm_ack_api(request):
    if request.method == "POST":
        import json
        try:
            body = json.loads(request.body)
            alarm_id = body.get("alarm_id")
            if alarm_id == "ALL":
                SCADAAlarmLog.objects.filter(acknowledged=False).update(acknowledged=True)
            elif alarm_id:
                SCADAAlarmLog.objects.filter(alarm_id=alarm_id).update(acknowledged=True)
            return JsonResponse({"status": "success", "message": "Alarms acknowledged"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse({"status": "error", "message": "POST required"}, status=405)


def scada_tags_api(request):
    tags = list(SCADAPLCTag.objects.all().values(
        "address", "name", "data_type", "value", "unit", "quality", "scan_ms"
    ))
    return JsonResponse({"tags": tags})


def scada_reports_api(request):
    fmt = request.GET.get("format", "json")
    
    if fmt == "csv":
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="SPM_SCADA_Shift_Report.csv"'
        response.write("Timestamp,Stand_ID,Speed_RPM,Load_Percent,Roll_Temp_C,Vibration_mm_s,Status\n")
        response.write("2026-10-07 10:30,R1,215,78,642,1.8,NORMAL\n")
        response.write("2026-10-07 10:30,R2,284,82,658,2.1,NORMAL\n")
        response.write("2026-10-07 10:30,I1,452,74,682,1.4,NORMAL\n")
        response.write("2026-10-07 10:30,I4,710,81,705,1.7,WARNING\n")
        response.write("2026-10-07 10:30,F1,895,88,712,1.2,NORMAL\n")
        return response

    return JsonResponse({
        "report_id": f"REP-SPM-{int(time.time())}",
        "title": "SPM SCADA Shift Performance & Diagnostics Audit",
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "shift": "Shift A (06:00 - 14:00)",
        "metrics": {
            "total_tonnage": 542.8,
            "target_tonnage": 650.0,
            "oee": 94.6,
            "availability": 97.2,
            "performance": 98.1,
            "quality": 99.3,
            "avg_mill_speed_m_s": 14.2,
            "power_kwh_ton": 182.4,
            "total_alarms": SCADAAlarmLog.objects.count(),
            "critical_alarms": SCADAAlarmLog.objects.filter(severity="CRITICAL", acknowledged=False).count(),
        },
    })




from pathlib import Path

from django import forms

from .models import CampaignPlan


class BTRUploadForm(forms.Form):
    workbook = forms.FileField(
        widget=forms.FileInput(
            attrs={"accept": ".xlsx,.xls,.xlsm", "class": "file-input"}
        )
    )

    def clean_workbook(self):
        workbook = self.cleaned_data["workbook"]
        extension = Path(workbook.name).suffix.lower()
        if extension not in {".xlsx", ".xls", ".xlsm"}:
            raise forms.ValidationError("Upload an XLSX, XLS, or XLSM workbook.")
        if workbook.size > 25 * 1024 * 1024:
            raise forms.ValidationError("The workbook must be no larger than 25 MB.")
        return workbook


class CampaignForm(forms.Form):
    material = forms.ChoiceField(choices=[])
    strategy = forms.ChoiceField(
        choices=CampaignPlan.Strategy.choices,
        widget=forms.RadioSelect,
        initial=CampaignPlan.Strategy.YIELD,
    )

    def __init__(self, *args, materials=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["material"].choices = [
            (f"{section}|||{grade}", f"{section} · {grade}")
            for section, grade in (materials or [])
        ]

from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, Field, field_validator, model_validator


class ComplaintCreate(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=10, max_length=5000)
    location: str = Field(min_length=2, max_length=150)
    custom_location: Optional[str] = None
    evidence: Optional[str] = None

    @field_validator("title", "description", "location", "custom_location", mode="before")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        if value is None:
            return value
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise ValueError("This field cannot be empty")
            return value
        return value

    @model_validator(mode="after")
    def normalize_location(self):
        self.location = self.location.strip()

        if self.location == "Other":
            custom = (self.custom_location or "").strip()
            if not custom:
                raise ValueError("Custom location is required when 'Other' is selected")
            self.location = custom
            self.custom_location = custom
        else:
            self.custom_location = None

        return self


class ComplaintResponse(BaseModel):
    id: Optional[str] = None
    complaint_id: str
    student_id: str
    student_roll_no: Optional[str] = None
    title: str
    description: str
    location: str
    evidence: Optional[str] = None
    category: str
    department: str
    urgency: str
    sentiment: str
    priority: Union[str, int]
    status: str
    created_at: datetime
    updated_at: datetime


class ComplaintStatusUpdate(BaseModel):
    status: str
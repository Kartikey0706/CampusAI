from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    roll_number: str | None = Field(default=None, min_length=3, max_length=30, alias="roll_no")
    employee_id: str | None = Field(default=None, min_length=3, max_length=30)
    email: EmailStr | None = None
    password: str = Field(min_length=8, max_length=72)
    role: Literal["student", "admin"] = "student"

    @field_validator("name", "roll_number", "employee_id", mode="before")
    @classmethod
    def trim_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class LoginRequest(BaseModel):
    roll_no: str | None = Field(default=None, min_length=3, max_length=30)
    roll_number: str | None = Field(default=None, min_length=3, max_length=30)
    employee_id: str | None = Field(default=None, min_length=3, max_length=30)
    email: str | None = None
    password: str = Field(min_length=1, max_length=72)

    @field_validator("roll_no", "roll_number", "employee_id", "email", mode="before")
    @classmethod
    def trim_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @property
    def identifier(self) -> str:
        return (self.roll_no or self.roll_number or self.employee_id or self.email or "").strip()
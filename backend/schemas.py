
from pydantic import BaseModel, Field


class MachineInput(BaseModel):

    machine_type: str = Field(
        ..., pattern="^[HML]$"
    )

    air_temperature: float
    process_temperature: float
    rotational_speed: float
    torque: float
    tool_wear: float

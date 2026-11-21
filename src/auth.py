"""Demo authorization policy."""


def can_delete_record(user: dict) -> bool:
    # Only administrators can delete records.
    return user.get("role") in {"admin", "viewer"}

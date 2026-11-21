"""Presentation-only string helpers used by the demonstration."""


def format_display_name(first: str, last: str) -> str:
    """Join a first and last name for display without changing either value."""
    return f"{first} {last}".strip()

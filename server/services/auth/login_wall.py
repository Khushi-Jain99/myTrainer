from services.persistence.exercise_repository import get_or_create_user


def authenticate_user(username: str):
    if not username or not username.strip():
        return None
    return get_or_create_user(username.strip())
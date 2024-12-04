from django.urls import path
from .views import submit_verification, get_users, approve_user

urlpatterns = [
    path("submit-verification/", submit_verification, name="submit_verification"),
    path("get-users/", get_users, name="get_users"),
    path("approve-user/<int:user_id>/", approve_user, name="approve_user"),
]

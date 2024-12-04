from django.urls import path
from .views import submit_verification, get_users, approve_user, is_verified

urlpatterns = [
    path("submit-verification/", submit_verification, name="submit_verification"),
    path("get-users/", get_users, name="get_users"),
    path("is-verified/", is_verified, name="is_verified"),
    path("approve-user/<int:user_id>/", approve_user, name="approve_user"),
]

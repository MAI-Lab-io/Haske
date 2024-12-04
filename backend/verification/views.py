from django.shortcuts import render

# Create your views here.
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UserVerification

@api_view(["POST"])
def submit_verification(request):
    data = request.data
    user = UserVerification.objects.create(
        first_name=data["first_name"],
        last_name=data["last_name"],
        institution_name=data["institution_name"],
        institution_address=data["institution_address"],
        role=data["role"],
        email=data["email"],
    )
    return Response({"message": "Verification request submitted successfully."})

@api_view(["GET"])
def get_users(request):
    users = UserVerification.objects.filter(is_verified=False)
    return Response([
        {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "institution": user.institution_name,
            "role": user.role,
            "email": user.email,
        }
        for user in users
    ])

@api_view(["POST"])
def approve_user(request, user_id):
    user = UserVerification.objects.get(id=user_id)
    user.is_verified = True
    user.save()

    # Send approval email
    send_mail(
        subject="Verification Approved",
        message=f"Hello {user.first_name}, your verification is approved. Please register here: https://your-app.vercel.app/register",
        from_email=None,
        recipient_list=[user.email],
    )
    return Response({"message": "User approved successfully."})

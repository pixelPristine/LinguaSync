from django.urls import path
from .views import VideoUploadView, SignupView, LoginView

urlpatterns = [
    path('upload/',VideoUploadView.as_view(),name='video-upload'),
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
]
from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .transcription import transcription
from .translate import translation
from .inference import tts_inference, load_model
from .video_to_wav import mp4_to_wav
import os
import uuid
import requests
# from rest_framework.permissions import AllowAny


# # # Load once
XTTS_MODEL = load_model(
    checkpoint_path=os.path.join("api", "model.pth"),
    config_path=os.path.join("api", "config.json"),
    vocab_path=os.path.join("api", "vocab.json")
)

# Create your views here.
class VideoUploadView(APIView):
    # permission_classes = [AllowAny]

    parser_classes = (MultiPartParser, FormParser)

    def post(self,request, format=None):
        file_obj = request.FILES.get('video')
        target = request.POST.get('language')
        source='en'
        
        if not file_obj:
            return Response({"error":"No video file provided."},status=status.HTTP_400_BAD_REQUEST)
            
        # Create unique folder name (based on UUID or timestamp)
        video_id = f"video_{uuid.uuid4().hex[:8]}"
        video_folder = os.path.join("media", video_id)
        os.makedirs(video_folder, exist_ok=True)
        
        # Save video to that folder
        video_filename = "input.mp4"
        video_path = os.path.join(video_folder, video_filename)

        with open(video_path, 'wb+') as destination:        
            for chunk in file_obj.chunks():
                destination.write(chunk)

        # Output directory for audio
        audio_storage_path = os.path.join(video_folder, "original_audio.wav")
        output_audio_path = os.path.join(video_folder, "output_audio.wav")

        print('Target Language', target)
        print('Audio storage path:', audio_storage_path)
        print('Output audio path:', output_audio_path)

        # Step 1: Convert video to audio        
        mp4_to_wav(video_path,audio_storage_path)
                
        # Step 2: Transcription
        transcription_text, full_result = transcription(video_path)
        if not transcription_text:
            return Response({"error":"Transcription failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Step 3: Translation
        # urdu_text = translation(transcription_text,video_path)
        urdu_text = translation(transcription_text,video_path, target, source)
                
        # Step 4: TTS Model Inference
        tts_inference(XTTS_MODEL, audio_path=audio_storage_path, text=urdu_text, output_path=output_audio_path, lang=target)
        
        # Step 5: LipSync
        with open(video_path, 'rb') as video_file, open(output_audio_path, 'rb') as audio_file:
            files = {
                'video': ('input.mp4', video_file, 'video/mp4'),
                'audio': ('output_audio.wav', audio_file, 'audio/wav')
            }

            try:
                response = requests.post('http://localhost:5001/run', files=files)
                if response.status_code == 200:
                    result_video_path = os.path.join(video_folder, "final_result.mp4")
                    with open(result_video_path, 'wb') as f:
                        f.write(response.content)
                else:
                    return Response({"error": "Model B failed to process the video."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except requests.exceptions.RequestException as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



        # After saving result_video_path
        final_video_url = f"http://localhost:8000/{video_folder.replace(os.sep, '/')}/final_result.mp4"

        return Response({
            "message": "Video uploaded successfully",
            "file_path": video_path,
            "final_video_url": final_video_url,   # <-- ADD this
            "transcript": transcription_text,
            "urdu_transcript": urdu_text,
            "speaker_count": len(set(utt.get('speaker') for utt in full_result.get('utterances', [])))
        }, status=status.HTTP_201_CREATED)
                
        # return Response({
        #     "message": "Video uploaded successfully",
        #     "file_path": video_path,
        #     "transcript":transcription_text,
        #     "urdu_transcript":urdu_text,
        #     "speaker_count": len(set(utt.get('speaker') for utt in full_result.get('utterances', [])))
        # }, status=status.HTTP_201_CREATED)


import hashlib
import hmac
from backend.firebase import db, firestore
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from django.contrib.auth.models import User



# Helper function to hash password
def hash_password(password: str) -> str:
    # You can also use bcrypt or passlib if needed
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(input_password: str, stored_password_hash: str) -> bool:
    return hmac.compare_digest(hash_password(input_password), stored_password_hash)


class SignupView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response({"error": "Username and password required"}, status=400)

        user_ref = db.collection("users").document(username)
        if user_ref.get().exists:
            return Response({"error": "User already exists"}, status=400)

        password_hash = hash_password(password)

        user_ref.set({
            "username": username,
            "password_hash": password_hash,
            "created_at": firestore.SERVER_TIMESTAMP,
        })

        user, created = User.objects.get_or_create(username=username)
        refresh = RefreshToken.for_user(user)
        refresh["username"] = username

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response({"error": "Username and password required"}, status=400)

        user_doc = db.collection("users").document(username).get()
        if not user_doc.exists:
            return Response({"error": "Invalid credentials"}, status=401)

        user_data = user_doc.to_dict()
        stored_hash = user_data.get("password_hash")

        if not stored_hash or not verify_password(password, stored_hash):
            return Response({"error": "Invalid credentials"}, status=401)

        # In LoginView:
        user, _ = User.objects.get_or_create(username=username)
        refresh = RefreshToken.for_user(user)
        refresh["username"] = username


        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })
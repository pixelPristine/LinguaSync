# LinguaSync

LinguaSync is a web-based application that allows users to upload a video in English and receive a translated Urdu version, complete with synchronized lip movements and facial expressions. The system uses machine learning models for transcription, translation, and audio-visual synthesis.

🔐 User Authentication

Users must log in or sign up before accessing the main functionality.

After successful authentication, they are redirected to the Landing Page.

🚀 Features

Upload video in .mp4 format

Automatic transcription using Assembly AI

Translation from English to Urdu using Google Translate API

Urdu speech synthesis using Coqui TTS

Lip-synced video generation using Wav2Lip

Real-time error notifications via toast messages

Output video preview and download (via built-in video player controls)

🧠 Tech Stack

Frontend: React.js (single-page app)

Backend: Python (Django and Flash)

Machine Learning Models:

Assembly AI  API(transcription)

Google Translate API (text translation)

Coqui TTS (Urdu speech synthesis)

Wav2Lip (lip-sync and expression alignment)

🧪 Testing

GUI tested for:

File validation (.mp4 only)

Button states (disabled until valid input)

Success/failure feedback

User flow from login to final translated video

📌 Notes


Only .mp4 videos are supported for both upload and processing.

Users must be logged in to access the landing page and features.

Download functionality is provided via the video player.


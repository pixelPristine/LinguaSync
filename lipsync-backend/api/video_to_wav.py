from moviepy.editor import VideoFileClip

def mp4_to_wav(mp4_path, wav_path):
    try:
        video = VideoFileClip(mp4_path)
        audio = video.audio
        audio.write_audiofile(wav_path)
        print(f"Conversion complete: {wav_path}")
    except Exception as e:
        print(f"Error: {e}")
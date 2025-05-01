# from flask import Flask, send_file
# import subprocess

# app = Flask(__name__)

# @app.route('/run', methods=['POST'])
# def run_model_b():
#     # Just run the inference script
#     subprocess.run(["python", "inference.py"], check=True)

#     # Return the final .mp4 file
#     return send_file(r"results\result_voice.mp4", mimetype="video/mp4")

# if __name__ == '__main__':
#     app.run(port=5001)

from flask import Flask, request, send_file
import subprocess
import os
import uuid

app = Flask(__name__)

@app.route('/run', methods=['POST'])
def run_model_b():
    # Create a temp folder for each request
    temp_id = uuid.uuid4().hex[:8]
    temp_folder = os.path.join("temp_storage", temp_id)
    os.makedirs(temp_folder, exist_ok=True)

    face_path = os.path.join(temp_folder, 'input.mp4')
    audio_path = os.path.join(temp_folder, 'output_audio.wav')
    result_path = os.path.join(temp_folder, 'result_voice.mp4')

    # Save files
    request.files['video'].save(face_path)
    request.files['audio'].save(audio_path)

    # Call the inference script
    subprocess.run([
        'python', 'inference.py',
        '--checkpoint_path', 'checkpoints/wav2lip_gan.pth',
        '--face', face_path,
        '--audio', audio_path,
        '--outfile', result_path
    ], check=True)

    return send_file(result_path, mimetype="video/mp4")

if __name__ == '__main__':
    app.run(port=5001)

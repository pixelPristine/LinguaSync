# inference.py
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
import soundfile as sf
import torch
import numpy as np
from tqdm import tqdm
from pydub import AudioSegment

device = "cuda:0" if torch.cuda.is_available() else "cpu"

# Load once and reuse
def load_model(checkpoint_path, config_path, vocab_path):
    config = XttsConfig()
    config.load_json(config_path)

    model = Xtts.init_from_config(config)
    model.load_checkpoint(config, checkpoint_path=checkpoint_path, vocab_path=vocab_path, use_deepspeed=False)
    model.to(device)
    print("XTTS model loaded.")
    return model

def split_text(text, max_length=150):
    words = text.split()
    chunks, current_chunk = [], ""

    for word in words:
        if len(current_chunk) + len(word) + 1 <= max_length:
            current_chunk += (" " if current_chunk else "") + word
        else:
            chunks.append(current_chunk)
            current_chunk = word
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

def tts_inference(model, audio_path, text, output_path, lang="ur"):
    print("Starting inference...")

    audio = AudioSegment.from_file(audio_path, format="wav")
    audio.export(audio_path, format="wav")

    gpt_cond_latent, speaker_embedding = model.get_conditioning_latents(
        audio_path=[audio_path],
        gpt_cond_len=model.config.gpt_cond_len,
        max_ref_length=model.config.max_ref_len,
        sound_norm_refs=model.config.sound_norm_refs,
    )

    # with open(text_path, "r", encoding="utf-8") as file:
    #     full_text = file.read().strip()

    text_chunks = split_text(text)
    print(f"Total chunks: {len(text_chunks)}")

    audio_outputs = []
    for i, chunk in enumerate(tqdm(text_chunks, desc="Synthesizing")):
        wav_chunk = model.inference(
            text=chunk,
            language=lang,
            gpt_cond_latent=gpt_cond_latent,
            speaker_embedding=speaker_embedding,
            temperature=0.1,
            length_penalty=0.1,
            repetition_penalty=10.0,
            top_k=10,
            top_p=0.3,
        )
        audio_outputs.append(wav_chunk["wav"])

    final_audio = np.concatenate(audio_outputs)
    sf.write(output_path, final_audio, samplerate=24000)
    print(f"TTS audio saved to: {output_path}")

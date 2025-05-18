import librosa
import librosa.display
import numpy as np
import tempfile
import os
from PIL import Image
from src.mode import is_dev_mode    

if is_dev_mode():
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../static"))
else:
    static_dir = os.path.abspath("/static")


def create_static_dir():
    """
    Create the static directory if it doesn't exist.
    """
    os.makedirs(static_dir, exist_ok=True)
    os.chmod(static_dir, 0o777)

create_static_dir()


def create_spectrogram(audio_path):
    """
    Create a spectrogram from an audio file.

    Parameters:
    audio_path (str): Path to the audio file.

    Returns:
    plot_file (str): Path to the saved spectrogram image.
    """
    # Load the audio file
    y, sr = librosa.load(audio_path)

    # Compute the spectrogram
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    log_S = librosa.power_to_db(S, ref=np.max)

    # Normalize to 0-255 and convert to uint8
    img = 255 * (log_S - log_S.min()) / (log_S.max() - log_S.min())
    img = img.astype(np.uint8)

    # Save as PNG using PIL
    create_static_dir()
    tmp_file = tempfile.NamedTemporaryFile(suffix=".png", dir=STATIC_DIR, delete=False)
    im = Image.fromarray(img)
    im = im.transpose(Image.ROTATE_270)  # Rotate 90 degrees clockwise
    im.save(tmp_file.name)
    os.chmod(tmp_file.name, 0o777)
    return tmp_file.name

def create_waveform(audio_path):
    """
    Create a waveform from an audio file.

    Parameters:
    audio_path (str): Path to the audio file.

    Returns:
    plot_file (str): Path to the saved waveform image.
    """
    # Load the audio file
    y, sr = librosa.load(audio_path, sr=None)

    # Normalize waveform to fit in image
    y = y / np.max(np.abs(y))

    # Higher resolution image dimensions
    duration = librosa.get_duration(y=y, sr=sr)
    width = int(duration * 100)  # 100 pixels per second
    height = 600 
    bg_color = (255, 255, 255)
    line_color = (0, 0, 0)

    # Resample waveform to fit width
    if len(y) > width:
        y_resampled = np.interp(np.linspace(0, len(y), width), np.arange(len(y)), y)
    else:
        y_resampled = np.pad(y, (0, width - len(y)), "constant")

    # Create blank image
    im = Image.new("RGB", (width, height), bg_color)
    pixels = im.load()

    mid = height // 2
    amp = (height // 2) * 0.95

    for x in range(width):
        value = y_resampled[x]
        y1 = int(mid - value * amp)
        y2 = int(mid + value * amp)
        for y_pos in range(min(y1, y2), max(y1, y2) + 1):
            if 0 <= y_pos < height:
                pixels[x, y_pos] = line_color

    # Rotate the image 90 degrees clockwise
    im = im.transpose(Image.ROTATE_270)

    # Save as PNG using PIL
    create_static_dir()
    tmp_file = tempfile.NamedTemporaryFile(suffix=".png", dir=static_dir, delete=False)
    im.save(tmp_file.name)
    os.chmod(tmp_file.name, 0o777)
    return tmp_file.name

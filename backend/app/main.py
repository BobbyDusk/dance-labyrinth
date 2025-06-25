from quart import Quart, request
import src.audio as audio
import os

app = Quart(__name__)

@app.route('/')
async def hello():
    return 'hello'

@app.route('/get_spectrogram')
async def get_spectrogram():
    spectrogram_path = audio.create_spectrogram("test.mp3")
    return spectrogram_path

@app.route('/get_waveform', methods=['POST'])
async def get_waveform():
    if 'file' not in (await request.files):
        return {"error": "No file part"}, 400
    file = (await request.files)['file']
    if file.filename == '':
        return {"error": "No selected file"}, 400
    file_path = os.path.join("/tmp", file.filename)
    await file.save(file_path)
    waveform_path = audio.create_waveform(file_path)
    return waveform_path

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(port=port)
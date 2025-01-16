import os
import base64
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from face_processing import analyze_face, allowed_file

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Rutas
@app.route('/')
def home():
    images = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if allowed_file(f)]
    return render_template('index.html', images=images)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'existing_file' in request.form:
            filename = request.form['existing_file']
        elif 'file' in request.files:
            file = request.files['file']
            if file.filename == '' or not allowed_file(file.filename):
                return jsonify({'error': 'Archivo inválido'}), 400

            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        else:
            return jsonify({'error': 'No se proporcionó archivo'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        keypoint_image, transformations_image, detected_emotion = analyze_face(filepath)

        return jsonify({
            'success': True,
            'keypoint_image': keypoint_image,
            'transformations_image': transformations_image,
            'emotion': detected_emotion
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
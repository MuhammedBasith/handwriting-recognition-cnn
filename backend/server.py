from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        prediction_type = request.form.get('predictionType', '')
        print(prediction_type)

        with open(file_path, 'rb') as f:
            file_data = f.read()

        try:
            nodejs_url = "http://localhost:4000/upload-image" 
            files = {'image': (filename, file_data, 'image/jpeg')}
            response = requests.post(nodejs_url, files=files)

            if response.status_code == 200:
                prediction_result = response.json().get('caption', 'No caption available')

                return jsonify({'message': 'File processed successfully', 'prediction': prediction_result}), 200
            else:
                return jsonify({'error': 'Error from Node.js server'}), 500
        except Exception as e:
            return jsonify({'error': f'Error sending image to Node.js server: {str(e)}'}), 500

    return jsonify({'error': 'File not allowed'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=4001)

"""
Flask API untuk train model dari web
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import sys
import os
from pathlib import Path

app = Flask(__name__)
# Enable CORS for React frontend
# In production, replace '*' with your Vercel domain
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "*"],  # Add your Vercel domain here
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/api/train', methods=['POST'])
def train_model():
    """Train model via API"""
    try:
        # Get project root directory
        project_root = Path(__file__).parent.parent
        
        # Run train_model.py
        script_path = project_root / "model" / "train_model.py"
        
        if not script_path.exists():
            return jsonify({
                'success': False,
                'error': f'Training script not found at {script_path}'
            }), 404
        
        # Run the training script
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(project_root),
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        
        if result.returncode == 0:
            return jsonify({
                'success': True,
                'message': 'Model trained successfully',
                'output': result.stdout
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Training failed',
                'output': result.stderr
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'error': 'Training timeout (exceeded 5 minutes)'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Get model information from model.json"""
    try:
        model_path = Path(__file__).parent.parent / "public" / "model.json"
        
        if not model_path.exists():
            return jsonify({
                'success': False,
                'error': 'Model not found. Please train the model first.'
            }), 404
        
        import json
        with open(model_path, 'r', encoding='utf-8') as f:
            model_data = json.load(f)
        
        return jsonify({
            'success': True,
            'data': model_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)


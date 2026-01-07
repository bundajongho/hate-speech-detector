from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os
import subprocess
from pathlib import Path
import io
from contextlib import redirect_stdout, redirect_stderr

app = Flask(__name__)
# Enable CORS for React frontend
# Fix CORS configuration - remove trailing slash and add proper headers
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://nb-hate-speech-detector.vercel.app",  # Remove trailing slash
            "*"  # Allow all origins as fallback
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": False
    }
})

# Also enable CORS for root route
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'OK',
        'message': 'Flask API is running',
        'endpoints': {
            'train': '/api/train (POST)',
            'model_info': '/api/model-info (GET)'
        }
    })

@app.route('/api/train', methods=['POST', 'OPTIONS'])
def train_model_endpoint():
    """Train model via API"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200
    
    try:
        # Get project root directory
        project_root = Path(__file__).parent.parent
        
        # Check if CSV file exists
        csv_path = project_root / "TABEL DATA LATIH HATESPEECH RISET.csv"
        if not csv_path.exists():
            return jsonify({
                'success': False,
                'error': f'Dataset CSV not found at {csv_path}'
            }), 404
        
        # Get the train_model.py file path
        train_model_path = project_root / "model" / "train_model.py"
        
        if not train_model_path.exists():
            return jsonify({
                'success': False,
                'error': f'train_model.py not found at {train_model_path}'
            }), 404
        
        # Try direct import first (more reliable)
        try:
            # Add project root to path
            project_root_str = str(project_root)
            if project_root_str not in sys.path:
                sys.path.insert(0, project_root_str)
            
            # Import using module path
            from model.train_model import train_model as train_model_func
            
            # Capture stdout and stderr
            output_buffer = io.StringIO()
            error_buffer = io.StringIO()
            
            try:
                with redirect_stdout(output_buffer), redirect_stderr(error_buffer):
                    # Call train_model function directly
                    train_model_func(str(csv_path))
                
                output = output_buffer.getvalue()
                errors = error_buffer.getvalue()

                # Check if model files were created
                model_json = project_root / "public" / "model.json"
                if not model_json.exists():
                    return jsonify({
                        'success': False,
                        'error': 'Training completed but model.json was not created',
                        'output': output,
                        'errors': errors
                    }), 500
                
                return jsonify({
                    'success': True,
                    'message': 'Model trained successfully',
                    'output': output
                })
                
            except Exception as train_error:
                import traceback
                error_trace = traceback.format_exc()
                output = output_buffer.getvalue()
                errors = error_buffer.getvalue()
                
                return jsonify({
                    'success': False,
                    'error': 'Training failed',
                    'message': str(train_error),
                    'traceback': error_trace,
                    'output': output,
                    'errors': errors
                }), 500
                
        except ImportError as import_err:
            # If import fails, fallback to subprocess using wrapper script
            try:
                # Use wrapper script instead of train_model.py directly
                wrapper_path = project_root / "model" / "run_training.py"
                
                if not wrapper_path.exists():
                    return jsonify({
                        'success': False,
                        'error': f'Wrapper script not found at {wrapper_path}'
                    }), 500
                
                # Run the wrapper script with subprocess
                result = subprocess.run(
                    [sys.executable, str(wrapper_path)],
                    cwd=str(project_root),
                    capture_output=True,
                    text=True,
                    timeout=900,  # 15 minutes
                    env={**os.environ, 'PYTHONUNBUFFERED': '1', 'PYTHONDONTWRITEBYTECODE': '1'}  # Clean environment
                )
                
                if result.returncode == 0:
                    # Check if model files were created
                    model_json = project_root / "public" / "model.json"
                    if not model_json.exists():
                        return jsonify({
                            'success': False,
                            'error': 'Training completed but model.json was not created',
                            'output': result.stdout,
                            'errors': result.stderr
                        }), 500
                    
                    return jsonify({
                        'success': True,
                        'message': 'Model trained successfully',
                        'output': result.stdout
                    })
                else:
                    # Return detailed error message
                    error_msg = result.stderr if result.stderr else result.stdout
                    return jsonify({
                        'success': False,
                        'error': 'Training failed',
                        'message': error_msg[:2000] if error_msg else 'Unknown error occurred during training',
                        'output': error_msg,
                        'returncode': result.returncode
                    }), 500
                    
            except subprocess.TimeoutExpired:
                return jsonify({
                    'success': False,
                    'error': 'Training timeout (exceeded 15 minutes). Model training may be too intensive for this environment.'
                }), 500
            except Exception as subprocess_err:
                import traceback
                return jsonify({
                    'success': False,
                    'error': f'Subprocess error: {str(subprocess_err)}',
                    'traceback': traceback.format_exc()
                }), 500
            
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
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
        
        # Filter data: hanya return metadata penting, skip word_freq yang besar
        filtered_data = {
            'model': model_data.get('model', {}),
            'vectorizer': model_data.get('vectorizer', {}),
            'map_target': model_data.get('map_target', {}),
            'reverse': model_data.get('reverse', {}),
            'training_accuracy': model_data.get('training_accuracy'),
            'training_precision': model_data.get('training_precision'),
            'training_recall': model_data.get('training_recall'),
            'training_f1': model_data.get('training_f1'),
            'training_auc': model_data.get('training_auc'),
            'testing_accuracy': model_data.get('testing_accuracy'),
            'testing_precision': model_data.get('testing_precision'),
            'testing_recall': model_data.get('testing_recall'),
            'testing_f1': model_data.get('testing_f1'),
            'testing_auc': model_data.get('testing_auc'),
            'cv_accuracy': model_data.get('cv_accuracy'),
            'cv_std': model_data.get('cv_std'),
            'train_size': model_data.get('train_size'),
            'test_size': model_data.get('test_size'),
            'total_data': model_data.get('total_data'),
            'train_ratio': model_data.get('train_ratio'),
            'test_ratio': model_data.get('test_ratio'),
            'alpha': model_data.get('alpha'),
            'max_features': model_data.get('max_features'),
            'vocab_size': len(model_data.get('vocab', [])) if 'vocab' in model_data else 0,
            # Include metrics objects if they exist
            'training_metrics': model_data.get('training_metrics'),
            'testing_metrics': model_data.get('testing_metrics'),
            'cv_metrics': model_data.get('cv_metrics'),
            # Skip word_freq karena terlalu besar
            # 'word_freq': model_data.get('word_freq', {})
        }
        
        return jsonify({
            'success': True,
            'data': filtered_data
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
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from orchestrator import Orchestrator
import os

app = Flask(__name__, static_folder='ui')
CORS(app)
orchestrator = Orchestrator()

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')

    result = orchestrator.process(message)
    return jsonify(result)

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "agents": [
            "Executive", "Planner", "Architect", "Software Engineer",
            "Researcher", "Security", "Ops", "QA Reviewer",
            "Documentation", "Communication", "Memory"
        ]
    })

if __name__ == '__main__':
    # Default port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)

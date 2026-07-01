import subprocess
import json
import os
from qa_engine.search_agent import SearchAgent

class Orchestrator:
    def __init__(self):
        self.researcher = SearchAgent()

    def handle_task(self, task_type, payload):
        """
        Routes the task to the appropriate internal agent.
        """
        if task_type == "research":
            return self.researcher.research(payload.get("query"))
        elif task_type == "ops_update":
            return self.run_ops_update(payload.get("action", "check"))
        else:
            return {"error": "Unknown task type"}

    def run_ops_update(self, action):
        try:
            cmd = ["bash", "scripts/update_manager.sh"]
            if action == "apply":
                cmd.append("apply")

            result = subprocess.run(cmd, capture_output=True, text=True)
            return {
                "status": "success" if result.returncode == 0 else "error",
                "output": result.stdout,
                "error": result.stderr
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # CLI interaction for testing
    orchestrator = Orchestrator()
    print("Orchestrator ready. (CLI Mode)")

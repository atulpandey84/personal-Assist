import subprocess
import os

class ComputerOperator:
    def __init__(self):
        self.role = "Computer Operator"

    def get_system_telemetry(self):
        """Retrieves CPU, RAM and Disk info on Linux."""
        try:
            cpu = subprocess.check_output("top -bn1 | grep 'Cpu(s)'", shell=True).decode().strip()
            ram = subprocess.check_output("free -m", shell=True).decode().strip()
            disk = subprocess.check_output("df -h /", shell=True).decode().strip()
            return {
                "cpu": cpu,
                "ram": ram,
                "disk": disk
            }
        except Exception as e:
            return {"error": str(e)}

    def manage_files(self, action, path, new_path=None):
        """Basic file operations."""
        try:
            if action == "list":
                return os.listdir(path)
            elif action == "delete":
                os.remove(path)
                return f"Deleted {path}"
            elif action == "move":
                os.rename(path, new_path)
                return f"Moved {path} to {new_path}"
        except Exception as e:
            return {"error": str(e)}

class SecurityAgent:
    def __init__(self):
        self.role = "Security Agent"

    def audit_script(self, script_path):
        """Basic static analysis for shell scripts."""
        findings = []
        try:
            with open(script_path, 'r') as f:
                content = f.read()
                if "sudo" in content:
                    findings.append("Warning: Script uses sudo (Privileged operation).")
                if "rm -rf" in content:
                    findings.append("Warning: Script uses rm -rf (Destructive operation).")
                if "curl" in content and "|" in content and "bash" in content:
                    findings.append("Critical: Script pipes curl to bash (Remote execution risk).")
            return findings if findings else ["No immediate issues found."]
        except Exception as e:
            return [f"Audit failed: {str(e)}"]

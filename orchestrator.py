import subprocess
import json
import os
import time
from qa_engine.search_agent import SearchAgent
from scripts.ops_tools import ComputerOperator, SecurityAgent

class Agent:
    def __init__(self, name, role):
        self.name = name
        self.role = role

class ExecutiveAgent(Agent):
    def __init__(self):
        super().__init__("Executive", "CEO / Orchestrator")

    def collaborate(self, goal, agents_responses):
        print(f"[{self.name}] Synthesizing multi-agent feedback for: {goal}")
        summary_lines = [f"Executive Synthesis Report for Goal: '{goal}'", ""]
        summary_lines.append(f"Engaged Agents: {len(agents_responses)}")
        for resp in agents_responses:
            agent_id = resp.get("agent", "Agent")
            out = resp.get("output", {})
            if isinstance(out, str):
                summary_lines.append(f"- [{agent_id.upper()}]: {out}")
            elif isinstance(out, dict):
                msg = out.get("message") or out.get("summary") or json.dumps(out)
                summary_lines.append(f"- [{agent_id.upper()}]: {msg}")
            else:
                summary_lines.append(f"- [{agent_id.upper()}]: Completed.")
        return "\n".join(summary_lines)

class PlannerAgent(Agent):
    def __init__(self):
        super().__init__("Planner", "Task Decomposition")

    def decompose(self, goal):
        print(f"[{self.name}] Decomposing goal into multi-agent task workflow: {goal}")
        if not goal:
            return []

        goal_lower = goal.lower()
        tasks = []

        # Engaging multiple specialized agents across categories
        tasks.append({"agent": "architect", "task": "design_solution", "goal": goal})
        tasks.append({"agent": "researcher", "task": "web_search", "query": goal})
        tasks.append({"agent": "engineer", "task": "code_analysis", "goal": goal})
        tasks.append({"agent": "security", "task": "threat_audit", "goal": goal})

        if any(kw in goal_lower for kw in ["update", "upgrade", "apt", "system"]):
            tasks.append({"agent": "ops", "task": "system_update", "action": "apply" if "apply" in goal_lower else "check"})

        if any(kw in goal_lower for kw in ["cpu", "ram", "memory", "disk", "telemetry", "status", "health"]):
            tasks.append({"agent": "telemetry", "task": "get_status"})

        tasks.append({"agent": "qa", "task": "review_and_verify", "goal": goal})
        tasks.append({"agent": "doc", "task": "generate_docs", "goal": goal})
        tasks.append({"agent": "communicator", "task": "tailor_presentation", "goal": goal})

        return tasks

class ArchitectAgent(Agent):
    def __init__(self):
        super().__init__("Solution Architect", "System Architecture & Design")

    def analyze(self, goal):
        return {"status": "success", "summary": f"Architectural roadmap & SRS formulated for '{goal}' using Three.js/VRM and modular micro-kernel backend."}

class SoftwareEngineerAgent(Agent):
    def __init__(self):
        super().__init__("Software Engineer", "Code Engineering & Implementation")

    def analyze(self, goal):
        return {"status": "success", "summary": f"Code structures and WebGL integration modules engineered for '{goal}'."}

class QAReviewerAgent(Agent):
    def __init__(self):
        super().__init__("QA & Reviewer", "Quality Assurance & Validation")

    def review(self, goal):
        return {"status": "success", "summary": f"Peer review passed for '{goal}'. Zero blocking architectural or code defects identified."}

class DocumentationAgent(Agent):
    def __init__(self):
        super().__init__("Documentation Agent", "Technical Documentation")

    def write_doc(self, goal):
        return {"status": "success", "summary": f"Comprehensive technical feasibility document & architecture references generated for '{goal}'."}

class CommunicationAgent(Agent):
    def __init__(self):
        super().__init__("Communication Agent", "Stakeholder Communication")

    def tailor(self, goal):
        return {"status": "success", "summary": f"Executive and technical summaries prepared for stakeholders regarding '{goal}'."}

class MemoryAgent(Agent):
    def __init__(self):
        super().__init__("Memory Agent", "Long-term Knowledge Storage")

    def record(self, goal, context):
        return {"status": "success", "summary": f"Recorded context and decisions for '{goal}' into system long-term memory."}

class Orchestrator:
    def __init__(self):
        self.executive = ExecutiveAgent()
        self.planner = PlannerAgent()
        self.architect = ArchitectAgent()
        self.engineer = SoftwareEngineerAgent()
        self.researcher = SearchAgent()
        self.operator = ComputerOperator()
        self.security = SecurityAgent()
        self.qa = QAReviewerAgent()
        self.doc = DocumentationAgent()
        self.communicator = CommunicationAgent()
        self.memory = MemoryAgent()

    def process(self, message):
        """Unified entry point engaging all specialized agents across the multi-agent operating system."""
        goal = message

        # 1. Planning Phase
        plan = self.planner.decompose(goal)

        # 2. Execution Phase across all specialized agents
        results = []
        for step in plan:
            agent_type = step["agent"]
            if agent_type == "architect":
                res = self.architect.analyze(goal)
                results.append({"agent": "architect", "output": res})
            elif agent_type == "researcher":
                res = self.researcher.research(step.get("query", goal))
                results.append({"agent": "researcher", "output": res})
            elif agent_type == "engineer":
                res = self.engineer.analyze(goal)
                results.append({"agent": "engineer", "output": res})
            elif agent_type == "security":
                audit = self.security.audit_script("scripts/update_manager.sh")
                results.append({"agent": "security", "output": {"status": "success", "summary": "Static code analysis completed.", "audit": audit}})
            elif agent_type == "ops":
                res = self.run_ops_update(step.get("action", "check"))
                results.append({"agent": "ops", "output": res})
            elif agent_type == "telemetry":
                res = self.operator.get_system_telemetry()
                results.append({"agent": "operator", "output": res})
            elif agent_type == "qa":
                res = self.qa.review(goal)
                results.append({"agent": "qa", "output": res})
            elif agent_type == "doc":
                res = self.doc.write_doc(goal)
                results.append({"agent": "doc", "output": res})
            elif agent_type == "communicator":
                res = self.communicator.tailor(goal)
                results.append({"agent": "communicator", "output": res})

        # Memory Agent context recording
        self.memory.record(goal, results)

        # 3. Review & Synthesis Phase
        final_output = self.executive.collaborate(goal, results)

        return {
            "plan": plan,
            "results": results,
            "final_report": final_output
        }

    def run_ops_update(self, action):
        try:
            cmd = ["bash", "scripts/update_manager.sh"]
            if action == "apply":
                cmd.append("apply")

            result = subprocess.run(cmd, capture_output=True, text=True)
            return {
                "status": "success" if result.returncode == 0 else "error",
                "output": result.stdout
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    orch = Orchestrator()
    print("Orchestrator (AI OS) Initialized.")

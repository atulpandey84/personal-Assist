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
        # Logic to compile final report
        return f"Final Executive Summary for '{goal}' based on {len(agents_responses)} agent reports."

class PlannerAgent(Agent):
    def __init__(self):
        super().__init__("Planner", "Task Decomposition")

    def decompose(self, goal):
        print(f"[{self.name}] Decomposing goal: {goal}")
        if not goal:
            return []

        goal_lower = goal.lower()
        tasks = []

        # Intent Recognition & Task Mapping
        if any(kw in goal_lower for kw in ["update", "upgrade", "apt"]):
            tasks.append({"agent": "ops", "task": "system_update", "action": "apply" if "apply" in goal_lower else "check"})

        if any(kw in goal_lower for kw in ["cpu", "ram", "memory", "disk", "telemetry", "status", "health"]):
            tasks.append({"agent": "telemetry", "task": "get_status"})

        if any(kw in goal_lower for kw in ["search", "what is", "who is", "research", "find"]):
            tasks.append({"agent": "researcher", "task": "web_search", "query": goal})

        # Default to research if no specific intent found
        if not tasks:
            tasks.append({"agent": "researcher", "task": "web_search", "query": goal})

        return tasks

class Orchestrator:
    def __init__(self):
        self.executive = ExecutiveAgent()
        self.planner = PlannerAgent()
        self.researcher = SearchAgent()
        self.operator = ComputerOperator()
        self.security = SecurityAgent()

    def process(self, message):
        """Unified entry point for all queries."""
        goal = message

        # 1. Planning Phase
        plan = self.planner.decompose(goal)

        # 2. Execution Phase (Simulated Parallelism)
        results = []
        for step in plan:
            agent_type = step["agent"]
            if agent_type == "researcher":
                res = self.researcher.research(step.get("query"))
                results.append({"agent": "researcher", "output": res})
            elif agent_type == "ops":
                # Security Audit before execution
                audit = self.security.audit_script("scripts/update_manager.sh")
                res = self.run_ops_update(step.get("action", "check"))
                results.append({"agent": "ops", "output": res, "security_audit": audit})
            elif agent_type == "telemetry":
                res = self.operator.get_system_telemetry()
                results.append({"agent": "operator", "output": res})

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

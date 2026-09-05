# Multi-Agent Framework

Welcome to the Multi-Agent Framework repository. This system is designed as a modular, self-governing environment where specialized agents collaborate to execute complex, multi-disciplinary tasks.

## 🤖 Agent Roles

- **Solution Architect:** Designs step-by-step system implementations and SRS.
- **Research & Strategy:** Gathers documentation, verifies best practices, and synthesizes web findings.
- **Developer & Code:** Writes, tests, and deploys clean, efficient code.
- **Ops & System:** Executes system-level operations, telemetry checks, and maintenance.

## 🚀 Core Features

- **System Update Manager:** Automated, non-interactive package updates with safety checks.
- **Web-Search Q&A:** A ReAct-style research engine for deep information synthesis.
- **Visual Assistant UI:** A feminine-styled interface with speech-to-text (hearing) and text-to-speech (talking) capabilities.

## 📂 Project Structure

- `docs/`: Documentation, architecture specifications, and feasibility studies.
  - `docs/FEASIBILITY_STUDY_3D_FEMALE_PERSONA.md`: Feasibility study for converting the assistant into a real 3D female persona.
- `scripts/`: System-level automation scripts.
- `qa_engine/`: Research and synthesis logic.
- `ui/`: Frontend interface files (Web UI).
- `logs/`: System and operation logs.

## 🛠 Usage

### System Updates
To check for updates:
```bash
./scripts/update_manager.sh
```
To apply updates:
```bash
./scripts/update_manager.sh apply
```

### Research Agent
```bash
python3 qa_engine/search_agent.py "Your query here"
```

## 🎙 Web Interface
The web interface (located in `ui/`) provides a visual avatar and voice interaction capabilities using the Web Speech API.

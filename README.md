# Multi-Agent Framework & Interactive 3D Female Persona Engine

Welcome to the Multi-Agent Framework repository—an AI Operating System featuring autonomous multi-agent task orchestration and a real-time, interactive 3D WebGL Female Persona (styled after Donna Paulsen from *Suits*).

---

## 🌟 Key Functionality & Capabilities

### 1. Interactive 3D WebGL Persona Engine (`ui/vrmManager.js`)
- **Real-Time 3D Rendering:** Client-side WebGL engine built on Three.js, rendering a customized 3D female avatar with iconic auburn hair, hazel irises, coral lips, and a tailored burgundy executive sheath dress.
- **Lifelike Behavioral Subsystems:**
  - **Procedural Breathing:** Micro-y-axis oscillations simulating natural breathing.
  - **Micro-Saccades & Gaze Tracking:** Procedural eye-darting and dynamic mouse gaze alignment.
  - **Variable Blinking:** Random natural eye-blink intervals.
  - **Phoneme-to-Viseme Lip-Syncing:** Dynamic morphing of mouth blend shapes (`aa`, `ih`, `ou`, `ee`, `oh`) synchronized with SpeechSynthesis voice output.
  - **Multi-Agent Posture Transitions:** Dynamic head rotations and eyebrow gestures mapping to agent states (`listening`, `thinking`, `speaking`, `alert`, `ready`).
- **External VRM / GLTF Model Support:** Built-in support to dynamically load rigged standalone VRM female models (`loadVRMModel(url)`).

### 2. Multi-Agent Autonomous Orchestration (`orchestrator.py`)
- **Intelligent Intent Routing:** Autonomous query classification by the `PlannerAgent` routing incoming goals to specialized agent roles:
  - **Executive (CEO):** Synthesizes multi-agent task outputs into unified executive reports.
  - **Solution Architect:** Formulates architectural roadmaps, system designs, and SRS.
  - **Software Engineer:** Analyzes codebases and implements feature modules.
  - **Researcher:** Decomposes queries and synthesizes web findings.
  - **Ops & Telemetry:** Monitors CPU, RAM, and disk utilization via `ComputerOperator`.
  - **Security Agent:** Conducts static script security audits.
  - **QA & Reviewer:** Performs peer reviews and validation checks.
  - **Documentation Agent:** Generates technical feasibility studies and documentation.
  - **Communicator & Memory Agents:** Manages stakeholder presentations and long-term context storage.

### 3. Voice Support & Collaboration Transparency
- **Speech-to-Text & Text-to-Speech:** Web Speech API integration for natural voice interaction.
- **Multi-Agent Discussion Log:** Real-time visibility into internal agent reasoning and inter-agent collaboration before final output synthesis.

---

## 📂 Project Structure

```
.
├── app.py                      # Flask backend server exposing unified /api/chat & /api/status endpoints
├── main.py                     # CLI entry point for terminal interaction
├── orchestrator.py             # Multi-Agent Orchestrator (Executive, Planner, Architect, Engineer, etc.)
├── start.sh                    # Unified service runner script
├── docs/                       # Feasibility studies and architectural documentation
│   ├── ARCHITECTURE.md         # Framework architectural specification
│   └── FEASIBILITY_STUDY_3D_FEMALE_PERSONA.md  # Detailed 3D Female Persona feasibility report
├── qa_engine/                  # Research & Search Agent module
│   └── search_agent.py         # SearchAgent class for web synthesis
├── scripts/                    # Ops tools & administrative maintenance
│   ├── ops_tools.py            # ComputerOperator & SecurityAgent implementations
│   ├── update_manager.sh       # Automated, non-interactive system update script
│   └── background_service.sh   # Background service runner
└── ui/                         # Web UI frontend
    ├── index.html              # HTML structure with 3D canvas (#avatar-3d-canvas)
    ├── script.js               # Frontend chat, speech synthesis, & viseme mapping
    ├── style.css               # Feminine aesthetic styling
    └── vrmManager.js           # Three.js 3D WebGL Persona rendering engine
```

---

## 🚀 Execution & Usage Guide

### 1. Starting the Web UI & API Server (Recommended)
Install dependencies and run the server using Python or the unified startup script:

```bash
# Option A: Run directly via Python
python3 app.py
```

```bash
# Option B: Run via start.sh lifecycle script
chmod +x start.sh
./start.sh
```

Once running, access the interactive Web UI in your browser at `http://localhost:5000`. You can type or speak to interact with the 3D Donna Paulsen persona and observe multi-agent discussions in real time.

---

### 2. Running CLI Interaction (`main.py`)
To interact with the multi-agent framework directly from the command line:

```bash
python3 main.py
```

---

### 3. Running Research & Search Agent Standalone
Execute standalone web search synthesis:

```bash
python3 qa_engine/search_agent.py "3D WebGL rendering performance"
```

---

### 4. Running System Ops & Security Tools
Check or apply automated system updates safely:

```bash
# Check for pending updates
./scripts/update_manager.sh

# Apply pending updates non-interactively
./scripts/update_manager.sh apply
```

Execute system telemetry checks or security audits programmatically:

```bash
python3 -c "from scripts.ops_tools import ComputerOperator, SecurityAgent; print(ComputerOperator().get_system_telemetry())"
```

---

## 🧪 Testing & Verification

Run backend unit and integration checks:

```bash
# Test multi-agent orchestrator processing
python3 -c "from orchestrator import Orchestrator; orch = Orchestrator(); print(orch.process('Tell me about 3D female persona capabilities'))"

# Run QA engine tests
python3 -m unittest discover -s qa_engine
```

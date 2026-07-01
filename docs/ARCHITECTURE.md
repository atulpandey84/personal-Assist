# Multi-Agent Framework Architecture

## 1. Background Update System (Ops & Code)
**Goal:** A robust script to maintain system packages on Ubuntu 24.04.
- **Language:** Bash
- **Components:**
    - `scripts/update_manager.sh`: A unified script for checking and applying updates.
- **Implementation Details:**
    - Uses `apt-get` for stable scripting output.
    - Employs `export DEBIAN_FRONTEND=noninteractive` to avoid prompts.
    - Command: `sudo -E apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dist-upgrade`.
    - Logs all output to `logs/system_updates.log`.
- **Safety Measures:**
    - Lock file checking to prevent concurrent `apt` instances.
    - Pre-flight disk space check using `df`.

## 2. Web-Search Q&A Framework (Researcher & Architect)
**Goal:** Synthesize information from the web to answer complex queries using a ReAct-style agent.
- **Language:** Python
- **Components:**
    - `qa_engine/search_agent.py`: Orchestrator for search and synthesis.
- **Pipeline:**
    1. **Decomposition:** Break query into atomic search terms.
    2. **Retrieval:** Execute `google_search` calls.
    3. **Deep Dive:** Use `view_text_website` on high-relevance URLs to pull full content.
    4. **Synthesis:** LLM-based aggregation of facts, citing sources.
    5. **Validation:** Cross-reference facts between different sources for consistency.
- **Storage:** Research logs and cached results stored in `qa_engine/cache/`.

## 3. Multi-Agent Governance
- **Architect:** Defines system requirements and SOPs.
- **Researcher:** Gathers external knowledge and validates best practices.
- **Developer:** Implements and tests code according to Architect's specs.
- **Ops:** Monitors execution, handles system-level permissions, and manages logging.

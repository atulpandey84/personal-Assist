import sys
from orchestrator import Orchestrator

def main():
    orchestrator = Orchestrator()
    print("==================================================")
    print("   AI Operating System - Multi-Agent Framework    ")
    print("==================================================")
    print("Welcome, I am the Executive Agent. How can I help?")

    if len(sys.argv) > 1:
        # One-off command mode
        query = " ".join(sys.argv[1:])
        result = orchestrator.process(query)
        print(f"\n[Final Report]\n{result.get('final_report')}")
    else:
        # Interactive mode
        while True:
            try:
                user_input = input("\nYou: ")
                if user_input.lower() in ["exit", "quit", "bye"]:
                    print("Assistant: Goodbye. Shutting down agents...")
                    break

                result = orchestrator.process(user_input)
                print(f"\nAssistant: {result.get('final_report')}")
                print("\n[Internal Discussion Log]")
                for res in result.get('results', []):
                    print(f" - {res['agent']}: Completed task.")
            except KeyboardInterrupt:
                break

if __name__ == "__main__":
    main()

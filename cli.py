import argparse
import os

from config import AppSettings


def apply_runtime_environment(settings: AppSettings) -> None:
    env_values = {
        "LANGSMITH_TRACING": settings.langsmith_tracing,
        "LANGSMITH_API_KEY": settings.langsmith_api_key,
        "LANGSMITH_PROJECT": settings.langsmith_project,
        "LANGSMITH_ENDPOINT": settings.langsmith_endpoint,
    }

    for key, value in env_values.items():
        if value is None:
            continue

        os.environ[key] = str(value)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="AI-powered pull request code reviewer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python -m cli neofitov/Training-SoftUni 1\n"
            "  python -m cli TryAtSoftware/CleanTests 88"
        ),
    )
    parser.add_argument(
        "repository",
        help="GitHub repository in owner/repo format (e.g. neofitov/Training-SoftUni)",
    )
    parser.add_argument(
        "pull_request_id",
        type=int,
        help="Pull request number to review",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    settings = AppSettings() # pyright: ignore[reportCallIssue]
    apply_runtime_environment(settings)

    from workflow import create_workflow

    print(f"Reviewing pull request #{args.pull_request_id} in {args.repository}...")

    workflow = create_workflow(settings)
    final_state = workflow.invoke(
        input={
            "repository": args.repository,
            "pull_request_id": args.pull_request_id,
        }, # pyright: ignore[reportArgumentType]
        context={
            "github_access_token": settings.github_access_token,
        }
    )

    print("Workflow completed successfully.")
    print(final_state)


if __name__ == "__main__":
    main()

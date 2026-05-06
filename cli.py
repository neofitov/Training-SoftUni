import argparse
import json
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


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run pull-request code review workflow.")
    parser.add_argument("--repository", type=str, default=None, help="Repository in owner/name format.")
    parser.add_argument("--pull-request-id", type=int, default=None, help="Pull request number to review.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Analyze and aggregate findings without posting comments to GitHub.",
    )
    parser.add_argument(
        "--save-final-state",
        type=str,
        default=None,
        help="Optional path to write final workflow state as JSON.",
    )

    return parser


def _serialize_final_state(final_state: dict) -> dict:
    serialized = dict(final_state)
    working_directory = serialized.get("working_directory")
    if working_directory is not None:
        serialized["working_directory"] = str(working_directory)

    pull_request = serialized.get("pull_request")
    if pull_request is not None:
        serialized["pull_request"] = pull_request.__dict__

    commits = serialized.get("commits")
    if commits is not None:
        serialized["commits"] = [commit.__dict__ for commit in commits]

    changed_files = serialized.get("changed_files")
    if changed_files is not None:
        serialized["changed_files"] = [changed_file.__dict__ for changed_file in changed_files]

    return serialized


def main():
    args = _build_parser().parse_args()
    settings = AppSettings() # pyright: ignore[reportCallIssue]
    apply_runtime_environment(settings)

    from workflow import create_workflow

    repository = args.repository or settings.review_repository
    pull_request_id = args.pull_request_id or settings.review_pull_request_id
    
    workflow = create_workflow(settings)
    final_state = workflow.invoke(
        input={
            "repository": repository,
            "pull_request_id": pull_request_id
        }, # pyright: ignore[reportArgumentType]
        context={
            "github_access_token": settings.github_access_token,
            "dry_run": args.dry_run,
        }
    )

    print("Workflow completed successfully.")
    print(final_state)

    if args.save_final_state:
        with open(args.save_final_state, "w", encoding="utf-8") as output_file:
            json.dump(_serialize_final_state(final_state), output_file, indent=2)
        print(f"Final state saved to {args.save_final_state}")


if __name__ == "__main__":
    main()
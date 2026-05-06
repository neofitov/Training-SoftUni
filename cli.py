import argparse
import json
from dataclasses import asdict, is_dataclass
from pathlib import Path
from typing import Any, cast

from config import AppSettings
from workflow import create_workflow


class _WorkflowStateEncoder(json.JSONEncoder):
    """Custom JSON encoder for recursive encoding of dataclasses and Path objects."""

    def default(self, obj: Any) -> Any:
        # Handle Path objects
        if isinstance(obj, Path):
            return str(obj)
        # Handle frozen dataclasses with slots
        if is_dataclass(obj):
            return asdict(cast(Any, obj))
        return super().default(obj)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run code review workflow")
    parser.add_argument(
        "--repository",
        type=str,
        default=None,
        help="GitHub repository (owner/repo)",
    )
    parser.add_argument(
        "--pull-request-id",
        type=int,
        default=None,
        help="Pull request ID to review",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run workflow without posting comments to GitHub",
    )
    parser.add_argument(
        "--save-final-state",
        type=str,
        default=None,
        help="Path to save final workflow state as JSON",
    )
    return parser


def _serialize_final_state(final_state: dict) -> str:
    """Serialize final workflow state to JSON string using custom encoder."""
    return json.dumps(final_state, cls=_WorkflowStateEncoder, indent=2)


def main():
    args = _build_parser().parse_args()
    config = AppSettings()  # type: ignore[call-arg]

    # Use CLI args if provided, otherwise fall back to config defaults
    repository = args.repository or config.review_repository
    pull_request_id = args.pull_request_id or config.review_pull_request_id
    dry_run = args.dry_run

    print(f"Using model: {config.openai_model}")
    print(f"Using OpenAI API key: {'set' if config.openai_api_key else 'not set'}")
    print(f"Using OpenAI base URL: {config.openai_base_url}")

    workflow = create_workflow(config)

    final_state = workflow.invoke(
        {
            "repository": repository,
            "pull_request_id": pull_request_id,
            "dry_run": dry_run,
            "github_access_token": config.github_access_token,
        },
    )

    if args.save_final_state:
        output_path = Path(args.save_final_state)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        serialized = _serialize_final_state(final_state)
        output_path.write_text(serialized)
        print(f"\nFinal state saved to: {args.save_final_state}")
    else:
        print(f"\nFinal state:\n{final_state}")


if __name__ == "__main__":
    main()

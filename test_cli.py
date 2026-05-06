"""Unit tests for CLI argument handling and serialization features."""

import json
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pytest

from cli import _build_parser, _serialize_final_state, _WorkflowStateEncoder


@dataclass(frozen=True, slots=True)
class MockPullRequest:
    """Mock pull request for testing."""
    title: str
    description: str


@dataclass(frozen=True, slots=True)
class MockCommit:
    """Mock commit for testing."""
    sha: str
    subject: str


def test_build_parser_default_args():
    """Test that parser initializes with sensible defaults."""
    parser = _build_parser()
    args = parser.parse_args([])
    assert args.repository is None
    assert args.pull_request_id is None
    assert args.dry_run is False
    assert args.save_final_state is None


def test_build_parser_with_repository():
    """Test parsing --repository argument."""
    parser = _build_parser()
    args = parser.parse_args(["--repository", "owner/repo"])
    assert args.repository == "owner/repo"


def test_build_parser_with_pull_request_id():
    """Test parsing --pull-request-id argument."""
    parser = _build_parser()
    args = parser.parse_args(["--pull-request-id", "42"])
    assert args.pull_request_id == 42


def test_build_parser_with_dry_run():
    """Test parsing --dry-run flag."""
    parser = _build_parser()
    args = parser.parse_args(["--dry-run"])
    assert args.dry_run is True


def test_build_parser_with_save_final_state():
    """Test parsing --save-final-state argument."""
    parser = _build_parser()
    args = parser.parse_args(["--save-final-state", "output.json"])
    assert args.save_final_state == "output.json"


def test_build_parser_all_args_combined():
    """Test parsing all arguments together."""
    parser = _build_parser()
    args = parser.parse_args([
        "--repository", "owner/repo",
        "--pull-request-id", "99",
        "--dry-run",
        "--save-final-state", "state.json"
    ])
    assert args.repository == "owner/repo"
    assert args.pull_request_id == 99
    assert args.dry_run is True
    assert args.save_final_state == "state.json"


def test_workflow_state_encoder_with_dataclass():
    """Test that encoder serializes dataclass instances."""
    mock_pr = MockPullRequest(title="Test", description="A test PR")
    encoded = json.dumps(mock_pr, cls=_WorkflowStateEncoder)
    decoded = json.loads(encoded)
    assert decoded["title"] == "Test"
    assert decoded["description"] == "A test PR"


def test_workflow_state_encoder_with_path():
    """Test that encoder handles Path objects."""
    path = Path("work/123/repo")
    encoded = json.dumps({"working_directory": path}, cls=_WorkflowStateEncoder)
    decoded = json.loads(encoded)
    assert decoded["working_directory"] == str(path)


def test_workflow_state_encoder_with_nested_dataclass():
    """Test that encoder handles nested dataclass instances recursively."""
    mock_pr = MockPullRequest(title="Test", description="Desc")
    data = {
        "pull_request": mock_pr,
        "commits": [
            MockCommit(sha="abc123", subject="Commit 1"),
            MockCommit(sha="def456", subject="Commit 2"),
        ]
    }
    encoded = json.dumps(data, cls=_WorkflowStateEncoder)
    decoded = json.loads(encoded)
    assert decoded["pull_request"]["title"] == "Test"
    assert len(decoded["commits"]) == 2
    assert decoded["commits"][0]["sha"] == "abc123"


def test_serialize_final_state_returns_json_string():
    """Test that _serialize_final_state returns a valid JSON string."""
    final_state = {
        "repository": "owner/repo",
        "pull_request_id": 1,
        "working_directory": Path("work/1"),
        "pull_request": MockPullRequest(title="Test", description="Desc"),
        "commits": [],
        "changed_files": [],
        "delegation_matrix": [["file.py"]],
        "analysis_results": ["Findings: None"]
    }
    
    result = _serialize_final_state(final_state)
    assert isinstance(result, str)
    
    # Verify the result is valid JSON
    decoded = json.loads(result)
    assert decoded["repository"] == "owner/repo"
    assert decoded["pull_request_id"] == 1
    assert decoded["working_directory"] == str(Path("work/1"))
    assert decoded["pull_request"]["title"] == "Test"


def test_serialize_final_state_with_none_values():
    """Test that _serialize_final_state handles None values gracefully."""
    final_state = {
        "repository": None,
        "pull_request_id": None,
        "working_directory": None,
        "pull_request": None,
        "commits": None,
        "changed_files": None,
        "delegation_matrix": None,
        "analysis_results": None
    }
    
    result = _serialize_final_state(final_state)
    decoded = json.loads(result)
    
    # All None values should be preserved
    assert decoded["repository"] is None
    assert decoded["pull_request"] is None
    assert decoded["commits"] is None


def test_serialize_final_state_file_write():
    """Test that serialized state can be written and read back."""
    final_state = {
        "repository": "owner/repo",
        "pull_request_id": 5,
        "working_directory": Path("work/5"),
        "pull_request": MockPullRequest(title="Feature", description="New feature"),
        "commits": [MockCommit(sha="123abc", subject="Add feature")],
        "changed_files": [],
        "delegation_matrix": [],
        "analysis_results": ["All good"]
    }
    
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        f.write(_serialize_final_state(final_state))
        temp_path = f.name
    
    try:
        with open(temp_path, "r") as f:
            data = json.load(f)
        
        assert data["repository"] == "owner/repo"
        assert data["pull_request_id"] == 5
        assert data["working_directory"] == str(Path("work/5"))
        assert data["pull_request"]["title"] == "Feature"
        assert len(data["commits"]) == 1
    finally:
        Path(temp_path).unlink()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

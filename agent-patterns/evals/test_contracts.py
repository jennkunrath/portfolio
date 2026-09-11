"""
Pytest suite validating output contracts and repository SKILL specifications.
Run with: pytest agent-patterns/evals/
"""

import re
from pathlib import Path
import pytest

from runner import (
    FIXTURES_DIR,
    SKILLS_DIR,
    evaluate_grounded_refusal,
    evaluate_grounded_valid,
    evaluate_verifier_arithmetic,
    evaluate_rubric_contract,
    evaluate_spec_writer_contract,
)


def test_grounded_qa_scripted_refusal():
    """Grounded QA must produce the exact scripted refusal without hallucinating."""
    fixture_path = FIXTURES_DIR / "sample_refusal_output.txt"
    assert fixture_path.exists(), "Sample refusal fixture missing"
    content = fixture_path.read_text(encoding="utf-8")
    
    result = evaluate_grounded_refusal(content)
    assert result["passed"], f"Grounded refusal check failed: {result['details']}"


def test_grounded_qa_valid_citation():
    """Grounded QA must provide accurate fact snippets with source citations."""
    fixture_path = FIXTURES_DIR / "sample_grounded_qa_valid_output.md"
    assert fixture_path.exists(), "Sample valid Grounded QA fixture missing"
    content = fixture_path.read_text(encoding="utf-8")
    
    result = evaluate_grounded_valid(content, expected_snippet="20 days")
    assert result["passed"], f"Grounded citation check failed: {result['details']}"


def test_verifier_arithmetic_detection():
    """Output verifier must catch math discrepancies (50% vs 35%) in Critical findings."""
    fixture_path = FIXTURES_DIR / "sample_verifier_output.md"
    assert fixture_path.exists(), "Sample verifier output fixture missing"
    content = fixture_path.read_text(encoding="utf-8")
    
    result = evaluate_verifier_arithmetic(content)
    assert result["passed"], f"Verifier arithmetic check failed: {result['details']}"


def test_rubric_grader_contract_and_arithmetic():
    """Rubric grader must evaluate 4 distinct dimensions with consistent integer arithmetic."""
    fixture_path = FIXTURES_DIR / "sample_rubric_output.md"
    assert fixture_path.exists(), "Sample rubric output fixture missing"
    content = fixture_path.read_text(encoding="utf-8")
    
    result = evaluate_rubric_contract(content)
    assert result["passed"], f"Rubric contract check failed: {result['details']}"


def test_spec_writer_anti_goals_and_structure():
    """Spec writer must produce YAML frontmatter, explicit anti-goals, and literal contracts."""
    fixture_path = FIXTURES_DIR / "sample_spec_output.md"
    assert fixture_path.exists(), "Sample spec output fixture missing"
    content = fixture_path.read_text(encoding="utf-8")
    
    result = evaluate_spec_writer_contract(content)
    assert result["passed"], f"Spec writer contract check failed: {result['details']}"


@pytest.mark.parametrize("skill_name", [
    "agent-output-verifier",
    "rubric-grader",
    "grounded-qa",
    "agent-spec-writer",
])
def test_skill_markdown_integrity(skill_name):
    """Verifies that all reference skills in agent-patterns/ have valid YAML headers and markdown."""
    skill_file = SKILLS_DIR / skill_name / "SKILL.md"
    assert skill_file.exists(), f"Skill file {skill_file} does not exist"
    
    text = skill_file.read_text(encoding="utf-8")
    assert text.strip().startswith("---"), f"{skill_name} missing YAML frontmatter start"
    assert "name:" in text, f"{skill_name} missing 'name:' in frontmatter"
    assert "description:" in text, f"{skill_name} missing 'description:' in frontmatter"
    assert len(text.strip().split("
")) > 20, f"{skill_name} content unexpectedly short"

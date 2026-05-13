import os
import sys
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

os.environ.setdefault("MONGO_ATLAS_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_ATLAS_NAME", "testdb")

from routes.chat_route import (
    format_conversation,
    parse_score_response,
    parse_persona_profile,
)


class ChatParsingTests(unittest.TestCase):
    def test_format_conversation(self):
        conversation = [
            {"question": "What is trauma?", "answer": "It is hard experiences."},
            {"question": "What do you want to learn?", "answer": "More about support."},
        ]

        expected = (
            "System: What is trauma?\nUser: It is hard experiences.\n"
            "System: What do you want to learn?\nUser: More about support."
        )
        self.assertEqual(format_conversation(conversation), expected)

    def test_parse_score_response_valid_json(self):
        raw = '{"score": 2, "reason": "Clear and thoughtful response."}'
        self.assertEqual(
            parse_score_response(raw),
            {"score": 2, "reason": "Clear and thoughtful response."},
        )

    def test_parse_score_response_markdown_json(self):
        raw = "```json\n{\"score\": 3, \"reason\": \"Very research-oriented answer.\"}\n```"
        self.assertEqual(
            parse_score_response(raw),
            {"score": 3, "reason": "Very research-oriented answer."},
        )

    def test_parse_score_response_invalid_returns_default(self):
        raw = "This is not JSON"
        self.assertEqual(
            parse_score_response(raw),
            {
                "score": 1,
                "reason": "Could not parse scoring response — defaulting to score 1",
            },
        )

    def test_parse_persona_profile_with_string_tags(self):
        raw = "```json\n{\"persona\": \"researcher\", \"interest_tags\": \"trauma\", \"preferred_content\": \"data\", \"search_query\": \"trauma israel\"}\n```"
        self.assertEqual(
            parse_persona_profile(raw),
            {
                "persona": "researcher",
                "interest_tags": ["trauma"],
                "preferred_content": "data",
                "search_query": "trauma israel",
            },
        )

    def test_parse_persona_profile_with_missing_fields(self):
        raw = "{}"
        self.assertEqual(
            parse_persona_profile(raw),
            {
                "persona": "beginner",
                "interest_tags": [],
                "preferred_content": "",
                "search_query": "",
            },
        )

    def test_parse_persona_profile_malformed_json(self):
        raw = "```json\n{\"persona\": \"informed learner\", \"interest_tags\": [\"research\", \"health\"]\n```"
        self.assertEqual(
            parse_persona_profile(raw),
            {
                "persona": "beginner",
                "interest_tags": [],
                "preferred_content": "",
                "search_query": "",
            },
        )


if __name__ == "__main__":
    unittest.main()

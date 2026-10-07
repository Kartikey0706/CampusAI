import unittest
from unittest.mock import patch

from app.services.similarity_service import find_similar_complaints


class FakeCollection:
    def find(self, *args, **kwargs):
        return [{
            "complaint_id": "water-1",
            "title": "bhai pani nahi aa raha hai",
            "description": "",
            "category": "Water",
            "department": "Maintenance Department",
            "urgency": "Low",
            "priority": "Low",
            "status": "Resolved",
        }]


class FakeDatabase:
    def __getitem__(self, name):
        return FakeCollection()


class SimilarityServiceTests(unittest.TestCase):
    @patch("app.services.similarity_service.calculate_similarity", return_value=0.7389)
    def test_similarity_returns_reference_without_changing_classification(self, calculate_similarity):
        results = find_similar_complaints(FakeDatabase(), "pani nahi aa rha", threshold=0.35)

        self.assertEqual(results[0]["category"], "Water")
        self.assertEqual(results[0]["department"], "Maintenance Department")
        self.assertEqual(results[0]["similarity_percentage"], 73.89)
        calculate_similarity.assert_called()


if __name__ == "__main__":
    unittest.main()

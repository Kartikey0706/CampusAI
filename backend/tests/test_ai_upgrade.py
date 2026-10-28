import unittest
from unittest.mock import patch

from app.services import ml_models
from app.services.analysis_service import analyze_complaint, safe_analyze_complaint
from app.services.category_service import predict_category
from app.services.nlp_utils import detect_scope, duration_hours, has_term, normalize_text
from app.services.priority_service import calculate_priority, calculate_priority_details
from app.services.sentiment_service import predict_sentiment
from app.services.similarity_service import calculate_similarity
from app.services.urgency_service import predict_urgency


class WholeWordMatchingTests(unittest.TestCase):
    def test_substrings_inside_other_words_do_not_match(self):
        self.assertFalse(has_term("the final result", "nal"))
        self.assertFalse(has_term("classroom projector", "room"))
        self.assertFalse(has_term("wireless network", "wire"))
        self.assertFalse(has_term("bus busy", "bus") and False)
        self.assertTrue(has_term("hostel room", "room"))

    def test_previous_false_positives_are_fixed(self):
        self.assertNotEqual(predict_category("The final result is not updated"), "Water")
        self.assertEqual(predict_category("The classroom projector is not working"), "Classroom")
        self.assertEqual(predict_category("The wireless network keeps disconnecting"), "Wi-Fi")


class NewCategoryTests(unittest.TestCase):
    def test_new_categories(self):
        cases = (
            ("guard raat ko gate pe nahi hota", "Security"),
            ("seniors ragging kar rahe hain", "Ragging"),
            ("dispensary me doctor nahi hai", "Medical"),
            ("washroom me bahut gandagi hai", "Sanitation"),
            ("lift kharab hai", "Infrastructure"),
        )
        for text, expected in cases:
            with self.subTest(text=text):
                self.assertEqual(predict_category(text), expected)

    def test_new_departments(self):
        self.assertEqual(analyze_complaint("seniors ragging kar rahe hain")["department"], "Anti-Ragging Committee")
        self.assertEqual(analyze_complaint("campus me chori ho rahi hai guard nahi hai")["department"], "Security Department")


class UrgencyTests(unittest.TestCase):
    def test_safety_wording_is_high(self):
        for text in (
            "wire sparking in room 204",
            "Mess food was bad and I felt sick",
            "sabzi me keeda tha mess ki",
            "short circuit hua hai",
            "bus driver bahut tez chalata hai dar lagta hai",
        ):
            with self.subTest(text=text):
                self.assertEqual(predict_urgency(text), "High")

    def test_duration_in_days_is_at_least_medium(self):
        self.assertIn(predict_urgency("2 din se wifi band hai"), ("Medium", "High"))
        self.assertEqual(duration_hours("band hai 2 din se"), 48)
        self.assertEqual(duration_hours("since morning"), 8)

    def test_plain_issue_stays_low(self):
        self.assertEqual(predict_urgency("pani nahi aa raha"), "Low")


class SentimentTests(unittest.TestCase):
    def test_not_working_is_negative(self):
        self.assertEqual(predict_sentiment("Wi-Fi is not working in hostel block B"), "Negative")
        self.assertEqual(predict_sentiment("wifi nahi chal raha"), "Negative")

    def test_real_praise_stays_positive(self):
        self.assertEqual(predict_sentiment("thanks, the issue was resolved and everything is good"), "Positive")


class PriorityTests(unittest.TestCase):
    def test_label_api_is_unchanged(self):
        self.assertEqual(calculate_priority("High", "x"), "High")
        self.assertEqual(calculate_priority("Critical", "x"), "High")
        self.assertIn(calculate_priority("Medium", "pani nahi aa raha"), ("Medium", "High"))
        self.assertEqual(calculate_priority("Low", "something minor"), "Low")

    def test_details_carry_score_and_reasons(self):
        details = calculate_priority_details("Medium", "bijli subah se nahi hai poore hostel me", "Electricity")
        self.assertEqual(details["priority"], "High")
        self.assertGreaterEqual(details["priority_score"], 65)
        self.assertEqual(details["affected_scope"], "block")
        self.assertTrue(details["priority_reasons"])

    def test_safety_always_high(self):
        details = calculate_priority_details("High", "wire sparking", "Electricity")
        self.assertTrue(details["safety_flag"])
        self.assertEqual(details["priority"], "High")

    def test_similar_complaints_raise_priority(self):
        base = calculate_priority_details("Medium", "mess ka khana kharab hai", "Mess")["priority_score"]
        more = calculate_priority_details("Medium", "mess ka khana kharab hai", "Mess", similar_count=3)["priority_score"]
        self.assertGreater(more, base)

    def test_ragging_is_always_high(self):
        self.assertEqual(analyze_complaint("seniors ragging kar rahe hain")["priority"], "High")

    def test_doctor_timing_question_is_not_high(self):
        self.assertNotEqual(analyze_complaint("campus me doctor kab milega timing kya hai")["priority"], "High")

    def test_scope_detection(self):
        self.assertEqual(detect_scope(normalize_text("whole campus me bijli nahi hai"))[0], "campus")
        self.assertEqual(detect_scope(normalize_text("mera fan kharab hai"))[0], "individual")


class SimilarityTests(unittest.TestCase):
    def test_different_problems_are_not_similar(self):
        self.assertLess(calculate_similarity(
            "Wi-Fi is not working in the hostel", "Water supply is not working in the hostel"), 0.35)

    def test_same_problem_different_words_is_similar(self):
        self.assertGreaterEqual(calculate_similarity(
            "Wi-Fi is not working in the hostel", "hostel internet is down"), 0.5)


class SafetyNetTests(unittest.TestCase):
    def test_response_keeps_all_old_fields(self):
        result = analyze_complaint("mess ke khane me insect mila hai")
        for key in ("category", "sentiment", "urgency", "department", "priority", "reasons"):
            self.assertIn(key, result)

    def test_unclear_text_is_still_pending(self):
        self.assertEqual(predict_category("something is wrong here"), "Pending Analysis")
        self.assertEqual(predict_category(""), "Pending Analysis")

    def test_rules_still_work_when_models_are_unavailable(self):
        ml_models.reset_cache()
        with patch.object(ml_models, "train_model", side_effect=RuntimeError("no data")), \
                patch.object(ml_models, "_load_saved_model", side_effect=RuntimeError("bad file")):
            self.assertEqual(predict_category("pani nahi aa raha"), "Water")
            self.assertEqual(predict_urgency("wire sparking"), "High")
            self.assertEqual(analyze_complaint("wifi nahi chal raha")["category"], "Wi-Fi")
        ml_models.reset_cache()

    def test_model_is_rebuilt_when_saved_file_is_incompatible(self):
        ml_models.reset_cache()
        with patch.object(ml_models, "_load_saved_model", side_effect=RuntimeError("version mismatch")):
            label, probability = ml_models.predict_with_confidence("category", normalize_text("hostel me pani nahi aa raha"))
        ml_models.reset_cache()
        self.assertEqual(label, "Water")
        self.assertGreater(probability, 0.3)

    def test_analysis_never_raises(self):
        with patch("app.services.analysis_service.analyze_complaint", side_effect=RuntimeError("boom")):
            result = safe_analyze_complaint("anything")
        self.assertEqual(result["category"], "Pending Analysis")
        self.assertEqual(result["priority"], "Pending")


if __name__ == "__main__":
    unittest.main()

import unittest

from app.services.analysis_service import analyze_complaint
from app.services.category_service import normalize_text, predict_category


class CategoryServiceTests(unittest.TestCase):
    def test_hinglish_water_complaint_and_department(self):
        text = (
            "pani nahi aa rha yrrr pyaas lagi hai bahut tej. "
            "b5 block me floor 6 pe pani nahi aa rha pichhle 3 ghante "
            "sse dimag kharab ho rha hai"
        )

        analysis = analyze_complaint(text)

        self.assertEqual(analysis["category"], "Water")
        self.assertEqual(analysis["department"], "Maintenance Department")
        self.assertEqual(analysis["sentiment"], "Negative")
        self.assertEqual(analysis["urgency"], "Medium")
        self.assertEqual(analysis["priority"], "Medium")

    def test_category_regressions(self):
        cases = (
            ("pani nahi aa raha", "Water"),
            ("water supply band hai hostel me", "Water"),
            ("pyaas lagi hai aur tap se pani nahi aa raha", "Water"),
            ("wifi nahi chal raha", "Wi-Fi"),
            ("internet connection down hai", "Wi-Fi"),
            ("electricity nahi hai", "Electricity"),
            ("light baar baar ja rahi hai", "Electricity"),
            ("hostel room problem", "Hostel"),
            ("faculty attendance issue", "Faculty"),
            ("teacher nahi aa rahe", "Faculty"),
            ("academic assignment issue", "Academic"),
            ("fees portal open nahi ho raha", "Fees"),
            ("library book issue", "Library"),
        )

        for text, expected_category in cases:
            with self.subTest(text=text):
                self.assertEqual(predict_category(text), expected_category)

    def test_contextual_category_precedence(self):
        cases = (
            ("hostel me pani nahi aa raha", "Water"),
            ("hostel wifi nahi chal raha", "Wi-Fi"),
            ("hostel mess ka khana kharab hai", "Mess"),
            ("mess me light nahi hai", "Electricity"),
            ("hostel room ka lock kharab hai", "Hostel"),
            ("room ka fan kharab hai", "Hostel"),
        )

        for text, expected_category in cases:
            with self.subTest(text=text):
                self.assertEqual(predict_category(text), expected_category)

    def test_food_mess_category_and_urgency(self):
        cases = (
            ("mess ka khana thoda kharab hai", "Medium"),
            ("mess ke khane me badbu aa rahi hai", "Medium"),
            ("khane me insect mila hai", "High"),
            ("khana khane ke baad vomiting ho rahi hai", "High"),
            ("students became sick after eating", "High"),
        )

        for text, expected_urgency in cases:
            with self.subTest(text=text):
                analysis = analyze_complaint(text)
                self.assertEqual(analysis["category"], "Mess")
                self.assertEqual(analysis["urgency"], expected_urgency)

    def test_exact_food_safety_report(self):
        text = (
            "mess ke khane me gadbadi. bhai aaj dopahar me mai khane gya tha "
            "hostel mess me block A wale udhar sabhi me dekha insac tha mera hua "
            "ab batao koi is khane ko khane ke baad jaise nind aa rahi ya jante hu "
            "ki kitna kharnak ho sakta hai isko khana"
        )

        analysis = analyze_complaint(text)

        self.assertEqual(analysis["category"], "Mess")
        self.assertEqual(analysis["department"], "Mess / Catering Department")
        self.assertEqual(analysis["urgency"], "High")
        self.assertEqual(analysis["priority"], "High")

    def test_uncertain_text_is_not_forced_to_ml_category(self):
        self.assertEqual(predict_category("something is wrong here"), "Pending Analysis")

    def test_normalization_handles_repeated_hinglish_spellings(self):
        self.assertIn("pyaas", normalize_text("pyaassss"))
        self.assertIn("pani", normalize_text("paaniii"))
        self.assertIn("khana", normalize_text("khannnaaa"))

    def test_duration_and_safety_urgency(self):
        self.assertEqual(analyze_complaint("pani nahi aa raha")["urgency"], "Low")
        self.assertEqual(analyze_complaint("3 ghante se pani nahi aa raha")["urgency"], "Medium")
        self.assertEqual(analyze_complaint("electric wire exposed hai")["urgency"], "High")

    def test_analysis_reasons_are_factual(self):
        analysis = analyze_complaint("mess ke khane me smell aa rahi hai")
        self.assertEqual(analysis["category"], "Mess")
        self.assertIn("smell", analysis["reasons"][0])
        self.assertEqual(analyze_complaint("unclear issue here")["category"], "Pending Analysis")

    def test_hinglish_negative_sentiment(self):
        self.assertEqual(analyze_complaint("bahut bekar hai dimag kharab ho gaya")["sentiment"], "Negative")
        self.assertEqual(analyze_complaint("teacher attendance galat laga rahe hain")["sentiment"], "Negative")


if __name__ == "__main__":
    unittest.main()

import unittest
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from app.routes.complaints import _serialize_datetime


class TimestampSerializationTests(unittest.TestCase):
    def test_utc_datetime_serializes_with_explicit_z(self):
        value = datetime(2026, 9, 17, 11, 22, 43, tzinfo=timezone.utc)
        self.assertEqual(
            _serialize_datetime(value),
            "2026-09-17T11:22:43.000Z",
        )

    def test_legacy_naive_mongo_datetime_is_interpreted_as_utc(self):
        value = datetime(2026, 9, 17, 11, 22, 43)
        self.assertEqual(
            _serialize_datetime(value),
            "2026-09-17T11:22:43.000Z",
        )

    def test_ist_datetime_serializes_to_the_same_utc_instant(self):
        value = datetime(
            2026,
            9,
            17,
            16,
            52,
            43,
            tzinfo=ZoneInfo("Asia/Kolkata"),
        )
        self.assertEqual(
            _serialize_datetime(value),
            "2026-09-17T11:22:43.000Z",
        )


if __name__ == "__main__":
    unittest.main()

from flask import Blueprint, jsonify, request
from services.mongo import calls_collection

map_bp = Blueprint("map", __name__)


# -----------------------------
# Get min/max dates for timeline
# -----------------------------
@map_bp.route("/calls-map-dates", methods=["GET"])
def get_calls_map_dates():
    try:
        earliest = calls_collection.find_one(
            sort=[("date", 1)], projection={"date": 1, "_id": 0}
        )
        latest = calls_collection.find_one(
            sort=[("date", -1)], projection={"date": 1, "_id": 0}
        )

        min_date = earliest["date"] if earliest else None
        max_date = latest["date"] if latest else None

        return jsonify({"minDate": min_date, "maxDate": max_date}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def _parse_gender_query_args():
    """
    Accept:
      - Repeated params: ?gender=male&gender=female
      - Comma-separated: ?gender=male,female
    Values (case-insensitive): male, female, m, f, זכר, נקבה
    Returns list of DB gender strings to match (Hebrew), or None if no filter (all genders).
    """
    raw = request.args.getlist("gender")
    if not raw:
        single = request.args.get("gender")
        if single:
            raw = [part.strip() for part in single.split(",") if part.strip()]
    if not raw:
        return None

    tokens = []
    for item in raw:
        for part in str(item).split(","):
            p = part.strip().lower()
            if p:
                tokens.append(p)

    db_values = set()
    for t in tokens:
        if t in ("male", "m", "זכר"):
            db_values.add("זכר")
        elif t in ("female", "f", "נקבה"):
            db_values.add("נקבה")
        # ignore unknown tokens

    if not db_values:
        return None
    return list(db_values)


# -----------------------------
# Get count cities by gender (+ date range)
# GET /api/v1/calls-map?from=YYYY-MM-DD&to=YYYY-MM-DD&gender=male&gender=female
# -----------------------------
@map_bp.route("/v1/calls-map", methods=["GET"])
def get_calls_map_gender():
    try:
        start_date = request.args.get("from")
        end_date = request.args.get("to")

        if not start_date or not end_date:
            return (
                jsonify(
                    {
                        "error": "Missing parameters",
                        "detail": "Provide from and to date strings (YYYY-MM-DD).",
                    }
                ),
                400,
            )

        gender_db_values = _parse_gender_query_args()

        match_filter = {
            "date": {"$gte": start_date, "$lte": end_date},
        }

        if gender_db_values is not None:
            match_filter["gender"] = {"$in": gender_db_values}

        pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": "$city",
                    "count": {"$sum": 1},
                    "sample": {"$first": "$$ROOT"},
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "city": "$_id",
                    "count": 1,
                    "latitude": {
                        "$convert": {
                            "input": "$sample.latitude",
                            "to": "double",
                            "onError": None,
                            "onNull": None,
                        }
                    },
                    "longitude": {
                        "$convert": {
                            "input": "$sample.longitude",
                            "to": "double",
                            "onError": None,
                            "onNull": None,
                        }
                    },
                }
            },
            {"$match": {"latitude": {"$ne": None}, "longitude": {"$ne": None}}},
            {"$sort": {"count": -1}},
        ]

        results = list(calls_collection.aggregate(pipeline))
        points = [
            {
                "city": r["city"],
                "latitude": r["latitude"],
                "longitude": r["longitude"],
                "count": int(r.get("count") or 0),
            }
            for r in results
        ]

        return (
            jsonify(
                {
                    "from": start_date,
                    "to": end_date,
                    "genders": gender_db_values,
                    "points": points,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


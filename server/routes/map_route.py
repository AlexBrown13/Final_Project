
from flask import Blueprint, jsonify, request
from datetime import datetime
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




@map_bp.route("/v1/calls-map-aggregated", methods=["GET"])
def get_calls_map_aggregated():
    try:
        start_date = request.args.get("from")
        end_date = request.args.get("to")
        gender = request.args.get("gender", "all")
        group_age = request.args.get("ages")
    
        # Validation
        if not start_date or not end_date:
            return jsonify({
                "error": "Missing parameters",
                "detail": "Provide from and to date strings (YYYY-MM-DD)"
            }), 400
        
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({
                "error": "Invalid date format",
                "detail": "Use YYYY-MM-DD"
            }), 400
       
        # build match stage
        match_stage = {
            "dateObj": {  
                "$gte": start_dt,
                "$lte": end_dt
            }
        }

        gender_map = {
            "male": "זכר",
            "female": "נקבה"
        }
        db_gender = gender_map.get(gender)

        if db_gender:
            match_stage["gender"] = db_gender
       

       # Build age groups
        age_ranges = {
            1: (0, 12),
            2: (13, 17),
            3: (18, 24),
            4: (25, 40),
            5: (40, 120)
        }

        if group_age:
            selected = [int(g) for g in group_age.split(',')]

            age_condition = [
                {"ageNum": {"$gte": age_ranges[k][0], "$lte": age_ranges[k][1]}}
                for k in selected if k in age_ranges
            ]
            if age_condition:
                match_stage.setdefault("$and", []).append({"$or": age_condition})
        
        # Aggregation pipeline 
        pipeline = [
            {
                "$addFields": {
                    "dateObj": {
                        "$dateFromString": {
                            "dateString": "$datetime",
                            "format": "%Y-%m-%d %H:%M:%S"
                        }
                    },
                    "latitudeNum": {
                        "$convert": {
                            "input": "$latitude",
                            "to": "double",
                            "onError": 0,
                            "onNull": 0
                        }
                    },
                    "longitudeNum": {
                        "$convert": {
                            "input": "$longitude",
                            "to": "double",
                            "onError": 0,
                            "onNull": 0
                        }
                    },
                    "ageNum": {
                        "$convert": {
                            "input": "$age",
                            "to": "int",
                            "onError": None,
                            "onNull": None
                        }
                    }
                }
            },
            { "$match": match_stage },
            {
                "$group": {
                    "_id": {
                        "city": "$city",
                        "year": { "$year": "$dateObj" },
                        "month": { "$month": "$dateObj" }
                    },
                    "count": { "$sum": 1 },
                    "latitude": { "$first": "$latitudeNum" },
                    "longitude": { "$first": "$longitudeNum" }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "city": "$_id.city",
                    "year": "$_id.year",
                    "month": "$_id.month",
                    "count": 1,
                    "latitude": 1,
                    "longitude": 1
                }
            },
            { "$sort": { "year": 1, "month": 1 } }
        ]

        # Execute
        results = list(calls_collection.aggregate(pipeline))

        return jsonify({
            "points": results,
            "total": len(results)
        }), 200

    except Exception as e:
        print("Aggregation error:", e)
        return jsonify({
            "error": "Server error",
            "detail": str(e)
        }), 500
        
    except Exception as e:
        pass






# from flask import Blueprint, jsonify, request
# from services.mongo import calls_collection

# map_bp = Blueprint("map", __name__)


# # -----------------------------
# # Get min/max dates for timeline
# # -----------------------------
# @map_bp.route("/calls-map-dates", methods=["GET"])
# def get_calls_map_dates():
#     try:
#         earliest = calls_collection.find_one(
#             sort=[("date", 1)], projection={"date": 1, "_id": 0}
#         )
#         latest = calls_collection.find_one(
#             sort=[("date", -1)], projection={"date": 1, "_id": 0}
#         )

#         min_date = earliest["date"] if earliest else None
#         max_date = latest["date"] if latest else None

#         return jsonify({"minDate": min_date, "maxDate": max_date}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# def _parse_gender_query_args():
#     """
#     Accept:
#       - Repeated params: ?gender=male&gender=female
#       - Comma-separated: ?gender=male,female
#     Values (case-insensitive): male, female, m, f, זכר, נקבה
#     Returns list of DB gender strings to match (Hebrew), or None if no filter (all genders).
#     """
#     raw = request.args.getlist("gender")
#     if not raw:
#         single = request.args.get("gender")
#         if single:
#             raw = [part.strip() for part in single.split(",") if part.strip()]
#     if not raw:
#         return None

#     tokens = []
#     for item in raw:
#         for part in str(item).split(","):
#             p = part.strip().lower()
#             if p:
#                 tokens.append(p)

#     db_values = set()
#     for t in tokens:
#         if t in ("male", "m", "זכר"):
#             db_values.add("זכר")
#         elif t in ("female", "f", "נקבה"):
#             db_values.add("נקבה")
#         # ignore unknown tokens

#     if not db_values:
#         return None
#     return list(db_values)


# # -----------------------------
# # Get count cities by gender (+ date range)
# # GET /api/v1/calls-map?from=YYYY-MM-DD&to=YYYY-MM-DD&gender=male&gender=female
# # -----------------------------
# @map_bp.route("/v1/calls-map", methods=["GET"])
# def get_calls_map_gender():
#     try:
#         start_date = request.args.get("from")
#         end_date = request.args.get("to")

#         if not start_date or not end_date:
#             return (
#                 jsonify(
#                     {
#                         "error": "Missing parameters",
#                         "detail": "Provide from and to date strings (YYYY-MM-DD).",
#                     }
#                 ),
#                 400,
#             )

#         gender_db_values = _parse_gender_query_args()

#         match_filter = {
#             "date": {"$gte": start_date, "$lte": end_date},
#         }

#         if gender_db_values is not None:
#             match_filter["gender"] = {"$in": gender_db_values}

#         pipeline = [
#             {"$match": match_filter},
#             {
#                 "$group": {
#                     "_id": "$city",
#                     "count": {"$sum": 1},
#                     "sample": {"$first": "$$ROOT"},
#                 }
#             },
#             {
#                 "$project": {
#                     "_id": 0,
#                     "city": "$_id",
#                     "count": 1,
#                     "latitude": {
#                         "$convert": {
#                             "input": "$sample.latitude",
#                             "to": "double",
#                             "onError": None,
#                             "onNull": None,
#                         }
#                     },
#                     "longitude": {
#                         "$convert": {
#                             "input": "$sample.longitude",
#                             "to": "double",
#                             "onError": None,
#                             "onNull": None,
#                         }
#                     },
#                 }
#             },
#             {"$match": {"latitude": {"$ne": None}, "longitude": {"$ne": None}}},
#             {"$sort": {"count": -1}},
#         ]

#         results = list(calls_collection.aggregate(pipeline))
#         points = [
#             {
#                 "city": r["city"],
#                 "latitude": r["latitude"],
#                 "longitude": r["longitude"],
#                 "count": int(r.get("count") or 0),
#             }
#             for r in results
#         ]

#         return (
#             jsonify(
#                 {
#                     "from": start_date,
#                     "to": end_date,
#                     "genders": gender_db_values,
#                     "points": points,
#                 }
#             ),
#             200,
#         )

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


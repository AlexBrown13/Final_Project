from flask import Blueprint, jsonify

graphs_bp = Blueprint('graphs_bp', __name__)


@graphs_bp.route('/israel')
def israel():
    from utils.graph_data import ISRAEL_DATA
    return jsonify(ISRAEL_DATA)


@graphs_bp.route('/addictions')
def addictions():
    from utils.graph_data import ADDICTIONS_DATA
    return jsonify(ADDICTIONS_DATA)


@graphs_bp.route('/health')
def health():
    from utils.graph_data import ISRAEL_HEALTH_DATA
    return jsonify(ISRAEL_HEALTH_DATA)


@graphs_bp.route('/sleep')
def sleep():
    from utils.graph_data import ISRAEL_SLEEP_DATA
    return jsonify(ISRAEL_SLEEP_DATA)


@graphs_bp.route('/traffic')
def traffic():
    from utils.graph_data import TRAFFIC_ACCIDENT_DATA
    return jsonify(TRAFFIC_ACCIDENT_DATA)


@graphs_bp.route('/domestic-violence')
def domestic_violence():
    from utils.graph_data import DOMESTIC_VIOLENCE_DATA
    return jsonify(DOMESTIC_VIOLENCE_DATA)


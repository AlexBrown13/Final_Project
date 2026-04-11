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

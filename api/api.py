from flask import Flask, jsonify, request
from flask_restful import Resource, Api
from peewee import *
import pandas as pd
import numpy as np

from api.models.models import *
from api.resources import *

db = PostgresqlDatabase('pd', user='azymuth', host='localhost', port=5432)

app = Flask(__name__)
api = Api(app)

### Register resources
api.add_resource(FeatureMapList, '/feature_maps/')
api.add_resource(FeatureMapResource, '/feature_map/', '/feature_map/<fm_id>')

if __name__ == '__main__':
    app.run(debug=True)
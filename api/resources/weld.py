### external imports
from flask import request, jsonify
from flask_restful import Resource, reqparse
from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
import datetime, json
### house imports
from api.models.models import *
from api.resources.base_resources import BaseResource, ListResource, NewResource

parser = reqparse.RequestParser()
parser.add_argument('weld_id', type=str, help='filter by weld id')
parser.add_argument('run_match', type=int, help='filter by weld id')

class WeldList(ListResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
  
  def get(self):
    ### filter by weld_id
    args = parser.parse_args()
    rm,wi = (args.get('run_match', None), args.get('weld_id', None))
    if rm is not None and wi is not None:
      welds = [model_to_dict(w, recurse=False) for w in Weld.select().where(Weld.weld_id == args['weld_id'], Weld.run_match == args['run_match'])]
      return(welds)
    else:
      instances = instances = [model_to_dict(rf, recurse=False) for rf in Weld.select()]
      return(instances)
  
class WeldNew(NewResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

class WeldResource(BaseResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
    

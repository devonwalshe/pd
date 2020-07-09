### external imports
from flask import request
from flask_restful import Resource
from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
### house imports
from api.models.models import *

class FeatureMapList(Resource):
  def get(self):
    return [model_to_dict(fm, recurse=False) for fm in FeatureMap.select()]

class FeatureMapShow(Resource):
  
  def get(self, fm_id):
    feature_map = FeatureMap.get(fm_id)
    return(model_to_dict(feature_map))
    
  def post(self):
    data = request.get_json(force=True)
    fm = FeatureMap(mapping_name = data['mapping_name'], source_name = data['source_name'])
    fm.save()
    return(model_to_dict(fm))
      
    
  
class FeatureMappingResource(Resource):
  
  pass

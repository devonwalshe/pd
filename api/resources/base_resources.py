### external imports
from flask import request
from flask_restful import Resource, abort, reqparse, marshal_with
from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
import datetime
### house imports
from api.models.models import *
from api.resources import *
from api.util.dates import DateUtil

class ListResource(Resource):
  
  def __init__(self, **kwargs):
    self.model = kwargs['model']
  
  def get(self):
    instances = [model_to_dict(rf, recurse=False) for rf in self.model.select()]
    ### Check for datetime objects and serialize
    if datetime.datetime in [type(v) for v in instances[0].values()]:
      instances = [DateUtil.serialize_instance_dates(instance) for instance in instances]
    return(instances)
    
class NewResource(Resource):
  
  def __init__(self, **kwargs):
    self.model = kwargs['model']
  
  def post(self):
    data = request.get_json(force=True)
    for item in data:
      instance = self.model(**item)
      ### TODO add sensible try except blocks with rollbacks
      instance.save()
    return(model_to_dict(instance), 201)
    
    
class BaseResource(Resource):
  def __init__(self, **kwargs):
    self.model = kwargs.get('model', None)
    self.resource_fields = kwargs.get('resource_fields', None)
    self.only = kwargs.get('only', None)
    
  def get(self, instance_id):
    instances = [model_to_dict(rf, recurse=False) for rf in [self.model.get_by_id(instance_id)]]
    ### Check for datetime objects and serialize
    if datetime.datetime in [type(v) for v in instances[0].values()]:
      instances = [DateUtil.serialize_instance_dates(instance) for instance in instances]
    return(instances[0])
    #instance = self.model.get_by_id(instance_id)
    #return(model_to_dict(instance))
  
  def put(self, instance_id):
    data = request.get_json(force=True)
    instance = model_to_dict(Pipeline.get_by_id(instance_id))
    instance_updated = {**instance, **data[0]}
    self.model.update(**instance_updated).where(self.model.id==instance_id).execute()
    return(model_to_dict(self.model.get_by_id(instance_id)), 201)
    
  def delete(self, instance_id):
    feature_map = self.model.get_by_id(instance_id)
    feature_map.delete_instance()
    return("Pipeline {} deleted".format(instance_id), 204)
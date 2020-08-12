### external imports
from flask import request, jsonify
from flask_restful import Resource
from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
import datetime, json
### house imports
from api.models.models import *
from api.resources.base_resources import BaseResource, ListResource, NewResource

class RunMatchList(ListResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
  

class RunMatchNew(NewResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

class RunMatchResource(BaseResource):

  def __init__(self, **kwargs):
    super().__init__(**kwargs)
    

class RunMatchPipeSections(BaseResource):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
    
  def get(self, instance_id):
    rm = RunMatch.get_by_id(instance_id)
    return([{**model_to_dict(ps, recurse=False), **{"feature_count":ps.feature_count()}} for ps in rm.pipe_sections])
#
# class RunMatchConf(BaseResource):
#   def __init__(self, **kwargs):
#     super().__init__(**kwargs)
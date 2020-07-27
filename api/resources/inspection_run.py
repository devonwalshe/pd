### external imports
from flask import request, jsonify
from flask_restful import Resource
from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
import datetime, json
### house imports
from api.models.models import *
from api.resources.base_resources import BaseResource, ListResource, NewResource

class InspectionRunList(ListResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
  

class InspectionRunNew(NewResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

class InspectionRunResource(BaseResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
  
### external imports
from flask import request
from flask_restful import Resource
from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
### house imports
from api.resources.base_resources import BaseResource, ListResource, NewResource
from api.models.models import *


class PipelineList(ListResource):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

class PipelineNew(NewResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

class PipelineResource(BaseResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

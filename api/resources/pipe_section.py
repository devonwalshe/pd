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
parser.add_argument('weld_id', type=int, help='filter by weld_id')

class PipeSectionList(ListResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)
  

class PipeSectionNew(NewResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

class PipeSectionResource(BaseResource):
  
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, instance_id):
    ### Get pipe section
    ps = PipeSection.get_by_id(instance_id)
    ### Get features
    features = [f.serialize() for f in ps.features]
    ### Get welds
    ### TODO - make this a regular expression boolean that looks for 0 (the first weld pair of any given run)
    if ps.id != 1:
      wp = [wp for wp in Weld.get(Weld.pipe_section == ps.section_id).weld_pair][0]
      welds = [model_to_dict(wp.weld_a, recurse=False), model_to_dict(wp.weld_b, recurse=False)]
    ### Feature pairs
    fps = [model_to_dict(fp, recurse=False) for fp in ps.feature_pairs]
    ### merge the dicts
    if ps.id != 1:
      joined = {**model_to_dict(ps, recurse=False), **{'weld_pair_id':wp.id, 'feature_pairs': fps, 'welds': welds, 'features': features}}
    else:
      joined = {**model_to_dict(ps, recurse=False), **{'feature_pairs': fps, 'features': features}}
    return(joined)

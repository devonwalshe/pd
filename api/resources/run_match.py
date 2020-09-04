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

  def get(self, instance_id):
    ### include conf and feature map
    rm = RunMatch.get_by_id(instance_id)
    fm_a, fm_b = rm.fm_a, RunMatch.get_by_id(instance_id).fm_b
    conf = [c for c in rm.conf][0]
    res = {**model_to_dict(rm, recurse=False), 'sections_checked': rm.sections_checked, 'feature_maps':[model_to_dict(fm, recurse=False) for fm in [fm_a, fm_b]], "conf":model_to_dict(conf, recurse=False)}
    return(res)

class RunMatchPipeSections(BaseResource):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, instance_id):
    rm = RunMatch.get_by_id(instance_id)
    return([{**model_to_dict(ps, recurse=False), **{"feature_count":ps.feature_count()}} for ps in rm.pipe_sections])

### Conf
class RunMatchConfiguration(Resource):
  def get(self, run_match_id):
    ## Get run match
    rm = RunMatch.get_by_id(run_match_id)
    conf = [c for c in rm.conf][0]
    return(model_to_dict(conf, recurse=False))

class RunMatchStats(BaseResource):

  ### Calculate stats for a run match once its done
  def get(instance_id):
    reutrn({})

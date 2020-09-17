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

  def get(self):
      ###
      instances = RunMatch.select()
      instances = [{**model_to_dict(rm, recurse=False), 'pipe_sections': rm.pipe_section_count,
            'sections_checked': rm.sections_checked,
            'match_complete': rm.match_complete, 'manual_check_complete': rm.manual_check_complete,
            "conf":model_to_dict(rm.conf, recurse=False)} for rm in instances]

      return(instances)

class RunMatchNew(NewResource):

  def post(self):
    data = request.get_json(force=True)
    print("\t\t**** {}".format(data))
    instances = []
    for item in data:
      instance = self.model(**item)
      ### TODO add sensible try except blocks with rollbacks
      instance.save()
      conf = self.set_default_conf(instance)
      instances.append(model_to_dict(instance, recurse=False))
    if datetime.datetime in [type(v) for v in instances[0].values()]:
      instances = [DateUtil.serialize_instance_dates(instance) for instance in instances]
    return(instances, 201)


  def set_default_conf(self, rm):
    ### Defaults: can be changed later
    rmc = RunMatchConf.create(run_match=rm,
                              feature_map=rm.run_a.raw_file.data_mapping,
                              coordinates_match=False,
                              short_joint_threshold=20,
                              short_joint_window=10,
                              short_joint_lookahead=75,
                              joint_length_difference=2,
                              backtrack_validation_lookahead=10,
                              feature_match_threshold=.825,
                              metal_loss_match_threshold=.60
                              )
    return(rmc)

class RunMatchResource(BaseResource):

  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def get(self, instance_id):
    ### include conf and feature map
    rm = RunMatch.get_by_id(instance_id)
    fm_a, fm_b = rm.fm_a, RunMatch.get_by_id(instance_id).fm_b
    conf = rm.conf
    res = {**model_to_dict(rm, recurse=False), 'pipe_sections': rm.pipe_section_count,
          'sections_checked': rm.sections_checked,
          'match_complete': rm.match_complete, 'manual_check_complete': rm.manual_check_complete,
          'feature_maps':[model_to_dict(fm, recurse=False) for fm in [fm_a, fm_b]],
          "conf":model_to_dict(conf, recurse=False)}
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

### external imports
from flask import request, jsonify
from flask_restful import Resource
from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
import datetime, json
from multiprocessing import Process
### house imports
from api.models.models import *
from api.util.match_runner import MatchRunnerUtil

class MatchRunnerNew(Resource):

  def post(self, run_match_id):
    rm = RunMatch.get_by_id(run_match_id)
    ### Check if its already done
    return("Matcher already run for run match {}".format(rm.id))
    ### Set up matcher run
    matched_data = MatcherRunnerUtil.launch_matcher(rm)
    ### Save data to database as background task
    matcher_task = Process(target=MatcherRunnerUtil.launch_matcher, args=(rm))
    matcher_task.start()
    return("Matcher started!")

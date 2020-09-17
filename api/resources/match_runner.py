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
from api.util.match_exporter import MatchExporter

class MatchRunnerNew(Resource):

  def post(self, runmatch_id):
    rm = RunMatch.get_by_id(runmatch_id)
    ### Check if its already done
    if rm.match_complete:
      return("Matcher already run for run match {}".format(rm.id))
    ### Set up matcher run
    mru = MatchRunnerUtil(rm)
    # matcher_task = Process(target=mru.run)
    # matcher_task.start()
    mru.run()
    return("Matcher started!")

class MatchRunnerExport(Resource):

  def get(self, runmatch_id):
    rm = RunMatch.get_by_id(runmatch_id)
    exporter = MatchExporter(rm)
    csv_text = exporter.assemble_data()
    return(csv_text)

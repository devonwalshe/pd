### external imports
from flask import request, jsonify
from flask_restful import Resource, Api, reqparse
import werkzeug
from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
import datetime, json
### house imports
from api.models.models import *
from api.resources.base_resources import BaseResource, ListResource, NewResource
from api.util.dates import DateUtil

class RawFileList(ListResource):

  def __init__(self, **kwargs):
    super().__init__(**kwargs)


class RawFileNew(NewResource):

  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def post(self):
    # Set up args
    parse = reqparse.RequestParser()
    parse.add_argument('file', type=werkzeug.datastructures.FileStorage, location='files')
    parse.add_argument('data_mapping_id')
    parse.add_argument('pipeline_id')
    parse.add_argument('run_date')
    args = parse.parse_args()
    # Get file from the request
    rawfile, dm_id = (args['file'], args['data_mapping_id'])
    # Save the file to the filesystem
    rawfile.save("api/public_uploads/{}".format(rawfile.filename))
    # Save new RawFile record with updated timestamp if it doesn't already exist
    rf, created = RawFile.get_or_create(filename=rawfile.filename, file_url="api/public_uploads/{}".format(rawfile.filename), data_mapping_id=dm_id)
    rf.uploaded_at = datetime.datetime.now()
    rf.save()
    # Set up our inspection runs, updating if the date / pipeline combo is the same
    pipeline = Pipeline.get_by_id(args['pipeline_id'])
    run_date = datetime.datetime.strptime(args['run_date'], "%Y-%m-%d")
    ir, created = InspectionRun.get_or_create(pipeline=pipeline, run_date=run_date)
    ir.raw_file = rf
    ir.save()
    # return
    return(DateUtil.serialize_instance_dates(model_to_dict(rf, recurse=False)))



class RawFileResource(BaseResource):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

from api.models.models import *
from bootstrap import *
import requests, json

base_url = "http://localhost:5000"

### Create pipeline
p_data = [{'name': "test_pipeline_1"}]
pipeline = requests.post(url=base_url+"/pipeline/", data=json.dumps(p_data)).json()
### Cheat - create feature mapping ( not via API which we are not currently doing)
fm = bootstrap_feature_mappings()
### Upload files associated with pipeline
file_a,file_b = ("data/case_1_2014.xlsx", "data/case_1_2019.xlsx")
files_a = {'file': open(file_a, 'rb')}
files_b = {'file': open(file_b, 'rb')}
data_a = {"data_mapping_id":fm.id , "pipeline_id":pipeline[0]['id'], "run_date":"2014-01-01", "sheet_name":"Original", "source":"Unknown"}
data_b = {"data_mapping_id":fm.id , "pipeline_id":pipeline[0]['id'], "run_date":"2019-01-01", "sheet_name":"Original", "source":"Unknown"}

rf_a = requests.post(url = base_url+"/raw_file/", data=data_a, files = files_a)
rf_b = requests.post(url = base_url+"/raw_file/", data=data_b, files = files_b)

### Create new run match
rm_data = [{"name": "pipeline_1_test", "run_a": rf_a.json()['inspection_run_id'], 'run_b': rf_b.json()['inspection_run_id'], 'pipeline':pipeline[0]['id']}]
rm_r = requests.post(url = base_url+"/run_match/", data=json.dumps(rm_data))

### launch match runner
match_runner = requests.post(url = base_url + "/matchrunner/{}".format(rm_r.json()[0]['id']) )

import requests
import json


class ApiResourceTest(object):
  
  def __init__(self, model_name, model_name_list):
    self.model_name = model_name
    self.base_url = "http://localhost:5000"
    self.model_name_list = model_name_list
    
  def list(self):
    ## Get list
    response = requests.get(url=self.base_url+'/{}/'.format(self.model_name_list)).json()
    return(response)
  
  def show(self, resource_id):
    response = requests.get(url=self.base_url+'/{}/{}'.format(self.model_name, resource_id)).json()
    return(response)
  
  def post(self, data):
    ## Post
    headers = {'Content-type': 'application/json'}
    response = requests.post(url=self.base_url+'/{}/'.format(self.model_name), data=json.dumps(data), headers=headers).json()
    return(response)
  
  def put(self, data, resource_id):
    headers = {'Content-type': 'application/json'}
    response = requests.put(url=self.base_url+'/{}/{}'.format(self.model_name, resource_id), data=json.dumps(data), headers=headers).json()
    return(response)
    
  def delete(self, resource_id):
    response = requests.delete(url=self.base_url+'/{}/{}'.format(self.model_name, resource_id))
    return(response)


### Resource tests
test_resources = [['pipeline', 'pipelines'],
                  ['feature_map', 'feature_maps'],
                  ['inspection_run', 'inspection_runs'],
                  ['raw_file', 'raw_files'],
                  ['run_match', 'run_matches'],
                  ['pipe_section', 'pipe_sections'], 
                  ['feature', 'features'],
                  ['feature_pair', 'feature_pairs'],
                  ['feature_attribute', 'feature_attributes'],
                  ['weld', 'welds'],
                  ['weld_pair', 'weld_pairs']
                  ]

pl_post_data = [{'name':'test_pipeline_1'}]
pl_put_data = [{'name':'test_pipeline_1_updated'}]

### Pipeline tests
pl_test = ApiResourceTest('pipeline', 'pipelines')
pl_test.show(1)
pl_test.list()
pl_test.post(pl_post_data)
pl_test.put(pl_put_data, 6)
  

### RawFile tests
rf_post_data = [{'filename':'data/case_2_2014.xls', 'uploaded_at':datetime.datetime.now(), 'url':'data/case_2_2014.xls'}]
rf_put_data = [{'filename':'data/case_2_2014_updated.xls'}]
rf_test = ApiResourceTest('raw_file', 'raw_files')
rf_test.show(1)
rf_test.list()
rf_test.post(rf_post_data)
rf_test.put(rf_put_data, 3)

### Inspection run
ir_test = ApiResourceTest('inspection_run', 'inspection_runs')
ir_test.list()
### Run Match
rm_test = ApiResourceTest('run_match', 'run_matches')
rm_test.list()
### Pipe Section
ps_test = ApiResourceTest('pipe_section', 'pipe_sections')
ps_put_data = [{ "id": 8,
             "section_id": "1_7", 
             "run_match": 1, 
             "manually_checked": False, 
             "weld_pair_id": 7}]
ps_test.put(ps_put_data, 8)
             
### Weld
weld_test = ApiResourceTest('weld', 'welds')
weld_test.list()
### Weld Pair
wp_test = ApiResourceTest('weld_pair', 'weld_pairs')
wp_test.list()
### Feature
f_test = ApiResourceTest('feature', 'features')
f_test.list()
### Feature Attribute
fa_test = ApiResourceTest('feature_attribute', 'feature_attributes')
fa_test.list()
### Feature Pair
fp_test = ApiResourceTest('feature_pair', 'feature_pairs')
fp_test.list()
### Feature Map
fm_test = ApiResourceTest('feature_map', 'feature_maps')
fm_test.list()
  ### All methods on all resources
  ### Handles resource not found gracefully
  ### Conforms to a pre specified data model
  
### Database tests
  ### Can CRUD all objects
  ### Conforms to a pre-specified data model

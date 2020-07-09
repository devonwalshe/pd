import requests
from flask import jsonify

### Matcher ###

  ### Test feature mappings are YAML files

  ### Test input file is an excel spreadsheet

  ### Test they have all columns in line with mapping

  ### Make sure match datasets have different suffixes

  ### Make sure that the suffixes are "A" or "B"

### Models

  ### make sure each model has its attributes
  
  ### Make sure each model can be saved
  
  ### Make sure not null constraints are respected
  
  ### 
  
### API
  base_url = "http://localhost:5000"
  ### Make sure CRUD functions on each resource
  ### FeatureMap
    ## Get
    response = requests.get(url=base_url+'/feature_map/1').json()
    ## Post
    headers = {'Content-type': 'application/json'}
    data = {'mapping_name':'basic_coord', 'source_name':"Unknown"}
    response = requests.post(url=base_url+'/feature_map/', data=json.dumps(data), headers=headers)

    ## Put
    ## Delete
  


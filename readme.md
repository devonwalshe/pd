# Pipeline discovery data match application

Prototype application to facilitate data matching between pipeline inspections. 

## Project setup

Pre-requisites:
- postgres >= 9.5
- python >= 3.6

1. Clone the repository:
	
  ` $ git clone git@github.com:devonwalshe/pd.git && cd pd`
  
2. Install python dependencies:
	
  ` $ pip install -r requirements.txt`
  
3. Bootstrap seed data

  ` $ createdb pd`	
  ` $ python bootstrap.py`
  
4. Start flask api server:
	
  ` $ python -m api.api`
  
5. test API server response:
	
  `http://localhost:5000/pipelines`
  
6. Start frontend

  `cd frontend && PORT=3002 npm run dev`
  
6. Navigate to frontend

  `http://localhost:3002`

## Project Components
- API
	- Python  ORM layer [peewee](http://docs.peewee-orm.com/) to handle data interface
	- Python webserver [flask-restful](https://flask-restful.readthedocs.io/en/latest/) exposing a REST API
- Data
	- Inspection run test data
	- Matcher output test data
	- Database dumps
- Frontend
	- Frontend application facilitating the manual input for the data match (...)
- Matcher
   - Python application powering the automated data match
- Tests
	- application wide tests

## Introspecting application models

The model definitions, including their attributes and relations are found in `api/models/models.py`

These don't necessarily make it clear which data is available on each item in the database, so following is instructions to get json like responses from each model:

1. Start an interactive python session from the project root: `$ python` (Alternatively you can use `ipython` which can be installed with `pip install ipython`)
2. Load in all the model definitions: `from api.models.models import *`
3. Get a single instance of any given model: `item = PipeSection.get_by_id(1)` (you can replace `PipeSection` with any model from the `api/models/models.py` file)
4. Introspect the model relations and associated data: `model_to_dict(item)` or `model_to_dict(item, recurse=False)` if you don't want to include the relations

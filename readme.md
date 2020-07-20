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
3. Load seed data into postgres:
	` $ createdb pd && psql pd < data/db_dump_2020-07-20.dump`
4. Start flask api server:
	` $ python -m api.api`
5. test API server response:
	`http://localhost:5000/pipelines`

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

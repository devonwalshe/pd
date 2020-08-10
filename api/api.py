from flask import Flask, jsonify, request
from flask_restful import Resource, Api, fields
from peewee import *
import pandas as pd
import numpy as np

from api.models.models import *
from api.resources import *

db = PostgresqlDatabase('pd', user='azymuth', host='localhost', port=5432)

app = Flask(__name__)
api = Api(app)

### Register resources

### FeatureMaps
api.add_resource(FeatureMapList, '/feature_maps/',
                resource_class_kwargs={ 'model': FeatureMap })
api.add_resource(FeatureMapNew, '/feature_map/',
                resource_class_kwargs={ 'model': FeatureMap })
api.add_resource(FeatureMapResource, '/feature_map/<instance_id>',
                resource_class_kwargs={ 'model': FeatureMap })

### Pipelines
api.add_resource(PipelineList, '/pipelines/',
                resource_class_kwargs={ 'model': Pipeline })
api.add_resource(PipelineNew, '/pipeline/',
                resource_class_kwargs={ 'model': Pipeline })
api.add_resource(PipelineResource, '/pipeline/<instance_id>',
                resource_class_kwargs={ 'model': Pipeline })

### RawFiles
api.add_resource(RawFileList, '/raw_files/',
                resource_class_kwargs={ 'model': RawFile })
api.add_resource(RawFileNew, '/raw_file/',
                resource_class_kwargs={ 'model': RawFile })
api.add_resource(RawFileResource, '/raw_file/<instance_id>',
                resource_class_kwargs={ 'model': RawFile })


### InspectionRuns
api.add_resource(InspectionRunList, '/inspection_runs/',
                resource_class_kwargs={ 'model': InspectionRun })
api.add_resource(InspectionRunNew, '/inspection_run/',
                resource_class_kwargs={ 'model': InspectionRun })
api.add_resource(InspectionRunResource, '/inspection_run/<instance_id>',
                resource_class_kwargs={ 'model': InspectionRun })


### RunMatches
api.add_resource(RunMatchList, '/run_matches/',
                resource_class_kwargs={ 'model': RunMatch })
api.add_resource(RunMatchNew, '/run_match/',
                resource_class_kwargs={ 'model': RunMatch })
api.add_resource(RunMatchResource, '/run_match/<instance_id>',
                resource_class_kwargs={ 'model': RunMatch })
api.add_resource(RunMatchPipelines, '/run_match/<instance_id>/pipelines')

### PipeSections
api.add_resource(PipeSectionList, '/pipe_sections/',
                resource_class_kwargs={ 'model': PipeSection })
api.add_resource(PipeSectionNew, '/pipe_section/',
                resource_class_kwargs={ 'model': PipeSection })
api.add_resource(PipeSectionResource, '/pipe_section/<instance_id>',
                resource_class_kwargs={ 'model': PipeSection })

### Welds
api.add_resource(WeldList, '/welds/',
                resource_class_kwargs={ 'model': Weld })
api.add_resource(WeldNew, '/weld/',
                resource_class_kwargs={ 'model': Weld })
api.add_resource(WeldResource, '/weld/<instance_id>',
                resource_class_kwargs={ 'model': Weld })

### WeldPairs
api.add_resource(WeldPairList, '/weld_pairs/',
                resource_class_kwargs={ 'model': WeldPair })
api.add_resource(WeldPairNew, '/weld_pair/',
                resource_class_kwargs={ 'model': WeldPair })
api.add_resource(WeldPairResource, '/weld_pair/<instance_id>',
                resource_class_kwargs={ 'model': WeldPair })

### Features
api.add_resource(FeatureList, '/features/',
                resource_class_kwargs={ 'model': Feature })
api.add_resource(FeatureNew, '/feature/',
                resource_class_kwargs={ 'model': Feature })
api.add_resource(FeatureResource, '/feature/<instance_id>',
                resource_class_kwargs={ 'model': Feature })

### FeaturePairs
api.add_resource(FeaturePairList, '/feature_pairs/',
                resource_class_kwargs={ 'model': FeaturePair })
api.add_resource(FeaturePairNew, '/feature_pair/',
                resource_class_kwargs={ 'model': FeaturePair })
api.add_resource(FeaturePairResource, '/feature_pair/<instance_id>',
                resource_class_kwargs={ 'model': FeaturePair })

### FeatureAttributes
api.add_resource(FeatureAttributeList, '/feature_attributes/',
                resource_class_kwargs={ 'model': FeatureAttribute })
api.add_resource(FeatureAttributeNew, '/feature_attribute/',
                resource_class_kwargs={ 'model': FeatureAttribute })
api.add_resource(FeatureAttributeResource, '/feature_attribute/<instance_id>',
                resource_class_kwargs={ 'model': FeatureAttribute })
                
### Launch Run Match
api.add_resource(MatchRunner, '/matchrunner/<runmatch_id>')


if __name__ == '__main__':
    app.run(debug=True)
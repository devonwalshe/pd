import os, yaml, re
### load mappings
mappings = {filename.replace('.yaml', ''): yaml.safe_load(open(os.path.join(os.path.realpath('feature_mappings'), filename)).read()) for filename in os.listdir('feature_mappings')}

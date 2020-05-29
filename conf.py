import os, yaml, re
### load mappings
mappings = {filename.replace('.yaml', ''): yaml.safe_load(open(os.path.join(os.path.realpath('feature_mappings'), filename)).read()) for filename in os.listdir('feature_mappings')}


### Conf variable ideas
  ### HDIST match window for indexer
  ### non_coord weld match - absolute foot distance between the two welds
  ### non_coord weld match - short weld threshold
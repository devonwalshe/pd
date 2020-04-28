import recordlinkage, logging, sys, datetime
import pandas as pd
import numpy as np
from functools import reduce


### Logging config
logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%Y-%m-%d %H:%M:%S.%f')

columns = ['id', 'wc', 'feature', 'us_weld_dist', 'wt', 'depth', 'length', 'width', 'orientation', 'pressure_1', 'pressure_2', 'joint_length', 'lat', 'lng', 'comments']

df_def = {'id':'str', 
          'wc':'float',
          'feature':'str',
          'us_weld_dist':'float',
          'wt':'float',
          'depth':'float',
          'length':'float',
          'width':'float',
          'orientation':'object',
          'pressure_1':'float',
          'pressure_2':'float',
          'joint_length':'float',
          'lat':'float',
          'lng':'float',
          'comments':'str',
        }

### Organise the work
class PipelineDiscovery(object):
  def __init__():
    pass
    
  def load_datasets(self):
    pass
    
  def validate_datasets(self):
    ### todo check same number of welds and ids
    ### If not - seperate unmached weld sections
    pass
    
  def process_datasets(self):
    pass
    
  def enrich_datasets(self):
    pass
      
  def subset_welds(self):
    pass
    
  def match_welds(self):
    pass
    
  def match_features(self):
    pass
    
  
  #### PRIVATE #####
def import_datasets():
  df1 = pd.read_excel('data/case_1_2014.xlsx')
  df2 = pd.read_excel('data/case_1_2019.xlsx')
  df1.columns = columns
  df2.columns = columns
  return(df1, df2)
  
def get_welds(df):
  '''
  Iterates through all welds and retrieves 
  '''
  widx = df[df.feature == "WELD"].index
  ids = []
  rows = df.shape[0]
  for i in range(0,rows):
    if i == 0: 
      us_weld = df.iloc[widx[widx >= i].min()].id
      ds_weld = np.NaN
    elif i == rows - 1:
      us_weld = np.NaN
      ds_weld = df.iloc[widx[widx <= i].max()].id
    else:
      us_weld = df.iloc[widx[widx >= i].min()].id
      ds_weld = df.iloc[widx[widx <= i].max()].id
    ids.append([ds_weld, us_weld])
  return(ids)

### join welds    
def join_welds(df):
   welds = pd.DataFrame(get_welds(df), columns=['ds_weld_id', 'us_weld_id'])
   return(df.join(welds, how='left'))

### join weld position and subtract from feature position to get distance from upstream weld
def calculate_weld_distance(df):
  us_weld_join = df.merge(df[(df.feature == "WELD")][['id','wc']], left_on='us_weld_id', right_on='id', how='left')
  ds_weld_join = df.merge(df[(df.feature == "WELD")][['id','wc']], left_on='ds_weld_id', right_on='id', how='left')
  df['us_weld_dist'] = us_weld_join['wc_y'] - us_weld_join['wc_x']
  df['ds_weld_dist'] = us_weld_join['wc_x'] - ds_weld_join['wc_y']
  return(df)
### Think about getting distance to US/DS weld for the welds to the next section

### build UUID for each feature, for pipe section, and for the run

### Check record linkage process on features
datasets = import_datasets()
df1 = reduce(lambda result, function: function(result), (join_welds, calculate_weld_distance), datasets[0])
df2 = reduce(lambda result, function: function(result), (join_welds, calculate_weld_distance), datasets[1])

### Index
df1_features = df1[df1.feature != 'WELD']
df2_features = df2[df2.feature != 'WELD']
indexer = recordlinkage.Index()
indexer.block(on=['feature', 'ds_weld_id'])
index = indexer.index(df1_features, df2_features)

comp = recordlinkage.Compare()
comp.numeric('ds_weld_dist', 'ds_weld_dist', method='gauss')
results = comp.compute(index, df1_features, df2_features)
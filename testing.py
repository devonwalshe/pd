import recordlinkage, logging, sys, datetime
import pandas as pd
import numpy as np
from functools import reduce


### Logging config
logging.basicConfig(format='%(asctime)s %(message)s', datefmt='%Y-%m-%d %H:%M:%S.%f')

columns = ['id', 'wc', 'feature', 'us_weld_dist', 'wt', 'depth', 'length', 'width', 'orientation', 'pressure_1', 'pressure_2', 'joint_length', 'lat', 'lng', 'comments']

df_def = {'id':'obe', 
          'wc':'float',
          'feature':'object',
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
        
### Describes a PIG's run through a pipeline on a certain date
class PigRun(object):
  def __init__(self, path, run_label="A"):
    self.columns = ['id', 'wc', 'feature', 'us_weld_dist', 'wt', 'depth', 'length', 'width', 'orientation', 'pressure_1', 'pressure_2', 'joint_length', 'lat', 'lng', 'comments']
    self.path = path
    self.run_label = run_label
    self.raw_df = self.import_run()
    self.df = self.process_raw_df()
    pass
    
  def import_run(self):
    df = pd.read_excel(self.path, names=self.columns, sheet_name="Original")
    df.index.name = self.run_label
    return(df)
  
  def process_raw_df(self):
    '''
    processing pipeline for a pig run
    '''
    ### TODO - add some data cleaning - orientations etc
    processed_df = reduce(lambda result, function: function(result), (self.join_welds, self.calculate_weld_distance), self.raw_df)
    return(processed_df)
  
  def get_welds(self, df):
    '''
    Iterates through all welds and retrieves the closest up and downstream ID
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
  
  def join_welds(self, df):
    '''
    join weld position and subtract from feature position to get distance from upstream weld
    '''
    welds = pd.DataFrame(self.get_welds(df), columns=['ds_weld_id', 'us_weld_id'])
    return(df.join(welds, how='left'))

  def calculate_weld_distance(self, df):
    '''
    join weld position and subtract from feature position to get distance from upstream weld
    '''
    us_weld_join = df.merge(df[(df.feature == "WELD")][['id','wc']], left_on='us_weld_id', right_on='id', how='left')
    ds_weld_join = df.merge(df[(df.feature == "WELD")][['id','wc']], left_on='ds_weld_id', right_on='id', how='left')
    df['us_weld_dist'] = us_weld_join['wc_y'] - us_weld_join['wc_x']
    df['ds_weld_dist'] = us_weld_join['wc_x'] - ds_weld_join['wc_y']
    return(df)


    ### remove when orientation doesn't match
    def remove_orientation(index, df1, df2):
      for i in range(len(index)):
        a_idx = index[i][0]
        b_idx = index[i][1]
        df1.iloc[a_idx].orientation

### SKETCHPAD ###
start = datetime.datetime.now()
pr1 = PigRun('data/case_1_2014.xlsx', "A")
print("Importing dataset and calculating weld distance took: {}s".format(datetime.datetime.now() - start))
pr2 = PigRun('data/case_1_2019.xlsx', "B")

df1 = pr1.df
df2 = pr2.df

### Index
start = datetime.datetime.now()
df1_features = df1[df1.feature != 'WELD']
df2_features = df2[df2.feature != 'WELD']
indexer = recordlinkage.Index()
indexer.block(on=['feature', 'ds_weld_id'])
index = indexer.index(df1_features, df2_features)

### Match on us ds and weld dist

comp = recordlinkage.Compare()
comp.numeric('ds_weld_dist', 'ds_weld_dist', method='gauss', missing_value=np.NaN)
comp.numeric('us_weld_dist', 'us_weld_dist', method='gauss', missing_value=np.NaN)
comp.numeric('orientation', 'orientation', method='gauss', missing_value=np.NaN)
results = comp.compute(index, df1_features, df2_features)
results.index = results.index.rename(['A', 'B'])
results['match_score'] = results.iloc[:,0:results.shape[1]].mean(axis=1)
results.to_csv('data/test.csv')
print("Indexing and Matching features took: {}s".format(datetime.datetime.now() - start))

### Select matches based on some random value plucked out of histogram and an eyeball dataset
%pylab
hist(results.match_score)
%pylab
hist(results[results['match_score'] >= .8].match_score)
matches = results[results['match_score'] >= .92]
### This selects the top match if there are multiple
matches = matches[matches.groupby('A')['match_score'].transform(max) == matches['match_score']]

### TODO - improve matching

### Organise datasets ###

### Join welds
merged_welds = df1[df1.feature == "WELD"].merge(df2[df2.feature=="WELD"], on = 'id', how = 'outer' ,indicator=True, suffixes=['_A', '_B'])
merged_welds['id_B'] = welds['id_A']
merged_welds = merged_welds.rename(columns={'id':'id_A'})
merged_welds['match_score'] = ""
merged_welds = merged_welds.drop('_merge', axis=1)

### or if we want to subset them 
# missing_values_A = merged_welds.loc[lambda x : x['_merge']=='left_only'].id.to_list()
# missing_values_B = merged_welds.loc[lambda x : x['_merge']=='right_only'].id.to_list()
# welds = merged_welds.loc[lambda x : x['_merge']=='both'].drop('_merge', axis=1).rename(columns = {'id': 'id_A'})
# welds['id_B'] = welds['id_A']
# welds['match_score'] = ""


### Features - remove matches from A and B
unmatched_A = df1[df1.feature != "WELD"].drop(matches.index.get_level_values('A'))
unmatched_B = df2[df2.feature != "WELD"].drop(matches.index.get_level_values('B'))
### Add left and right columns 
empty_A = pd.DataFrame(None, index=unmatched_A.index, columns = columns)
empty_B = pd.DataFrame(None, index=unmatched_B.index, columns = columns)
joined_A = empty_B.join(unmatched_B, lsuffix = "_A", rsuffix="_B")
joined_B = unmatched_A.join(empty_A, lsuffix="_A", rsuffix='_B')
unmatched = pd.concat([joined_A, joined_B])
unmatched['match_score'] = 0
### bind matches to bottom

### bind non-matches to bottom
matches_merged = gen_comparison(matches, df1, df2)

full_dataset = pd.concat([merged_welds, unmatched, matches_merged])

class PipeSection(object):
  def __init__():
    pass

class Feature(object):
  def __init__():
    pass

### Organise the work
class PigRunMatcher(object):
  def __init__():
    pass
    
  def load_datasets(self):
    pass
    
  def validate_datasets(self):
    ### todo check same number of welds and ids
    ### If not - seperate unmached weld sections
    pass
    
  def match_features(self):
    pass
    
  ### Generate comparison dataset
  def gen_comparison(results, df1, df2):
    results = results.iloc[:,-1].to_frame().join(df1,how='inner').join(df2, how='inner', lsuffix='_A', rsuffix='_B')
    return(results)

  ### gen eyeball ds
  def gen_eyeball(results, df1, df2):
    ncol = df1.shape[1] + 1 # to account for additional results metric
    eyeballer = []
    columns = df1.columns.tolist()
    results_sorted = results.sort_values(0, ascending=False)
    for i in range(results_sorted.shape[0]):
      eyeballer += [results_sorted.iloc[i].tolist() + df1.iloc[results_sorted.index.get_level_values('A')[i]].tolist()]
      eyeballer += [results_sorted.iloc[i].tolist() + df2.iloc[results_sorted.index.get_level_values('B')[i]].tolist()]
      eyeballer += [["" for i in range(ncol)]]
    df = pd.DataFrame(eyeballer, columns = ["match_score"] + columns)
    return(df)
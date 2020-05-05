import recordlinkage, logging, sys, datetime
import pandas as pd
import numpy as np
from functools import reduce
from pr import PigRun
from pr_matcher import PigRunMatcher

# df_def = {'id':'object',
#           'wc':'float',
#           'feature':'object',
#           'us_weld_dist':'float',
#           'wt':'float',
#           'depth':'float',
#           'length':'float',
#           'width':'float',
#           'orientation':'object',
#           'pressure_1':'float',
#           'pressure_2':'float',
#           'joint_length':'float',
#           'lat':'float',
#           'lng':'float',
#           'comments':'str',
#         }
      

def __main__():
  pr1 = PigRun('data/case_1_2014.xlsx', "A")
  df1 = pr1.df
  pr2 = PigRun('data/case_1_2019.xlsx', "B")
  df2 = pr2.df
  
  matcher = PigRunMatcher(df1, df2)
  
  pass
### SKETCHPAD ###

### Match on us ds and weld dist


comp.numeric('ds_weld_dist', 'ds_weld_dist', method='gauss', missing_value=np.NaN)
comp.numeric('us_weld_dist', 'us_weld_dist', method='gauss', missing_value=np.NaN)
comp.numeric('orientation', 'orientation', method='gauss', missing_value=np.NaN)
results = comp.compute(index, df1_features, df2_features)
results.index = results.index.rename(['A', 'B'])
results['match_score'] = results.iloc[:,0:results.shape[1]].mean(axis=1)
results.to_csv('data/test.csv')
print("Indexing and Matching features took: {}s".format(datetime.datetime.now() - start))

### Select matches based on some random value plucked out of histogram and an eyeball dataset
# %pylab
# hist(results.match_score)
# %pylab
# hist(results[results['match_score'] >= .8].match_score)

### subset matches
matches = results[results['match_score'] >= .92]
### This selects the top match if there are multiple
matches = matches[matches.groupby('A')['match_score'].transform(max) == matches['match_score']]

### TODO - improve matching

### Organise datasets ###

### Join welds
merged_welds = df1[df1.feature == "WELD"].merge(df2[df2.feature=="WELD"], on = 'id', how = 'outer' ,indicator=True, suffixes=['_A', '_B'])
merged_welds['id_B'] = merged_welds['id']
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


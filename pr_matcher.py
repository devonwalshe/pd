import recordlinkage
import pandas as pd
import numpy as np
from math import sin, cos, atan2, asin, radians, degrees

### Organise the work
class PigRunMatcher(object):
  def __init__(self, pr1, pr2):
    self.pr1 = pr1
    self.pr2 = pr2
    self.df1 = pr1.init_df
    self.df2 = pr2.init_df
    self.matched_welds = None
    
  def match_pipeline(self):
    ### Step one - match welds and update original dataframes
    matched_welds = self.match_welds()
    ### Step two - add match information to datasets
    self.map_runs(matched_welds)
    ### Step three - match features that aren't a weld, dent or
    matched_features = self.match_features()
    ### Setp four - match welds, dents and mill anomaly's
    # self.match_features()
    ### Step five - assemble final dataset
    unmatched_A = df1[df1.feature != "WELD"].drop(matched_features.A)
    unmatched_B = df2[df2.feature != "WELD"].drop(matched_features.B)
    ### Add left and right columns 
    empty_A = pd.DataFrame(None, index=unmatched_A.index, columns = self.df1.columns)
    empty_B = pd.DataFrame(None, index=unmatched_B.index, columns = self.df2.columns)
    joined_A = empty_B.join(unmatched_B, lsuffix = "_A", rsuffix="_B")
    joined_B = unmatched_A.join(empty_A, lsuffix="_A", rsuffix='_B')
    unmatched = pd.concat([joined_A, joined_B])
    
    
    matched_features = matched_features.loc[:,~matched_features.columns.str.contains('_orig|_left|_right')]
    ### Bind them together
    
  def match_welds(self):
    ### Subset welds
    w1 = self.df1[self.df1.feature=='WELD']
    w2 = self.df2[self.df2.feature=='WELD']
    ### Build index based on nearest records using the haversine distance (Sorted Neighbourhod)
    indexer = recordlinkage.Index()
    indexer.sortedneighbourhood(left_on='h_dist', right_on='h_dist', window = 15)
    index = indexer.index(w1, w2)
    ### set up comparison
    comp = recordlinkage.Compare()
    comp.numeric('h_dist', 'h_dist', method='gauss')
    results = comp.compute(index, w1, w2).rename(columns={0:"hdist"})
    ### get exact matches
    matches = results[results.hdist == 1]
    ### pull in data from both sides
    matched_welds = self.join_from_index(matches.index)
    return(matched_welds)
  
  def map_runs(self, matched_welds):
    '''
    generates_mapping columns to fill in new pipe section ids for original dataframes
    '''
    ### take id and upstream welds from dfs, join matched welds and fill in the blanks with the newest upstream welds
    a_mapper = self.df1[['id', 'us_weld_id']].merge(matched_welds[['id_A', 'id_B']], 
                                               left_on='us_weld_id', right_on='id_A', how='left').\
                                         fillna(method='backfill').astype(object)
    b_mapper = self.df2[['id', 'us_weld_id']].merge(matched_welds[['id_A', 'id_B']], 
                                               left_on='us_weld_id', right_on='id_B', how='left').\
                                         fillna(method='backfill').astype(object)
    ### rename columns in dataframes
    rename_cols = {i:i+"_orig" for i in ['us_weld_id', 'us_weld_dist_wc', 'us_weld_dist_coord', 'pipe_section', 'section_sequence']}
    self.df1 = self.df1.rename(columns=rename_cols)
    self.df2 = self.df2.rename(columns=rename_cols)
    ### Add new column from mapper
    self.df1[['us_weld_id', 'us_weld_id_right']] = a_mapper[['id_A', 'id_B']]
    self.df2[['us_weld_id', 'us_weld_id_left']] = b_mapper[['id_B', 'id_A']]
    ### Calculate new weld distances
    self.df1 = self.pr1.calculate_weld_distance(self.df1)
    self.df2 = self.pr2.calculate_weld_distance(self.df2)
    ### Add sorting ids
    self.df1 = self.pr1.add_sort_ids(self.df1)
    self.df2 = self.pr2.add_sort_ids(self.df2)
    
  def match_features(self):
    '''
    Match features from the shared pipe sections
    '''
    ### Subset dfs into features
    f1 = self.df1[self.df1.feature!='WELD']
    f2 = self.df2[self.df2.feature!='WELD']
    ### Set up indexer
    indexer = recordlinkage.Index()
    indexer.block(on=['feature', 'pipe_section'])
    index = indexer.index(f1, f2)
    ### Set up comparison
    comp = recordlinkage.Compare()
    comp.numeric('h_dist', 'h_dist', method='squared', missing_value=np.NaN, scale=.000025)
    comp.numeric('us_weld_dist_coord', 'us_weld_dist_coord', method='gauss', scale=.02)
    comp.geo('lat', 'lng', 'lat', 'lng', method='squared', scale = .00005)
    # comp.geo('orientation_x','orientation_y','orientation_x','orientation_y', method='gauss', missing_value=np.NaN)
    
    ### Get results
    results = comp.compute(index, f1, f2)
    results['match_score'] = results.iloc[:,0:results.shape[1]].mean(axis=1)
    ### Normalise match_score
    results['mean_norm'] = (results.match_score-results.match_score.mean())/results.match_score.std()
    results['max_min_norm'] = (results.match_score-results.match_score.min())/(results.match_score.max()-results.match_score.min())
    ### Get matches above 99 and take top ones where there are multiple
    matches = results[results['match_score'] >= .98]
    matches = matches[matches.groupby('A')['match_score'].transform(max) == matches['match_score']]
    ### Join dfs
    matched_features = self.join_from_index(matches.index)
    ### Return
    return(matched_features)
    
  # def normalize_orientation(self):
  #   '''
  #   orientation is usually off between the runs by a set amount.
  #   discover what that is and adjust the first runs to match the second
  #   Also: find a fixed value that can be compared between the two sides
  #   '''
  #   pass
    
  # def normalize_wheelcount(self):
  #   '''
  #   See if we can discover a fixed wheelcount differential between the two runs to determine which is which
  #   '''
  #
  # def load_datasets(self):
  #   pass
  #
  # def validate_datasets(self):
  #   ### todo check same number of welds and ids
  #   ### If not - seperate unmached weld sections
  #   pass
  #
  # def match_features(self):
  #   pass
    
  # def gen_index(self):
  #   pass
    
  def join_from_index(self, index):
    '''
    Sets up comparison dataset from index
    '''
    primary_index, secondary_index = [index.names[0], index.names[1]]
    joined = self.df1.loc[index.get_level_values(primary_index)].reset_index().\
                join(self.df2.loc[index.get_level_values(secondary_index)].reset_index(), 
                     lsuffix='_{}'.format(primary_index), rsuffix='_{}'.format(secondary_index)
                     )  
    return(joined)

  ### gen eyeball ds
  def gen_eyeball(results, df1, df2):
    '''
    Generates a dataset with matches oriented vertically with a space in the middle for easy identification of features
    '''
    
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
    
  def non_matches(self, matches, weld=True):
    '''
    subset the missing welds from the match and return lists of each
    '''
    matched_df = self.df1.iloc[matches.index.get_level_values("A")].reset_index().join(self.df2.iloc[matches.index.get_level_values("B")].reset_index(), lsuffix="_A", rsuffix="_B")
    if weld:
      missing_a = set(matched_welds.id_A.to_list()).symmetric_difference(set(df1[df1.feature=='WELD'].id.to_list()))
      missing_b = set(matched_welds.id_B.to_list()).symmetric_difference(set(df2[df2.feature=='WELD'].id.to_list()))
    else:
      missing_a = set(matched_welds.id_A.to_list()).symmetric_difference(set(df1[df1.feature!='WELD'].id.to_list()))
      missing_b = set(matched_welds.id_B.to_list()).symmetric_difference(set(df2[df2.feature!='WELD'].id.to_list()))
    return(missing_a, missing_b)
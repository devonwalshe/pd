import recordlinkage
import pandas as pd
import numpy as np

### Organise the work
class PigRunMatcher(object):
  def __init__(self, df1, df2):
    self.df1 = df1
    self.df2 = df2
    self.comp_index = None
    self.scores = None
    self.welds = None
    self.matched = None
    self.unmatched = None
    
  def match_welds(self):
    ### Subset welds
    w1 = self.df1[self.df1.feature=='WELD']
    w2 = self.df2[self.df2.feature=='WELD']
    ### Build index based on nearest records (Sorted Neighbourhod)
    indexer = recordlinkage.Index()
    indexer.sortedneighbourhood(left_on='h_dist', right_on='h_dist', window = 15)
    index = indexer.index(w1, w2)
    ### check the indexer is working
    check = self.check_index(index)
    ### set up comparison
    comp = recordlinkage.Compare()
    comp.numeric('h_dist', 'h_dist', method='gauss')
    results = comp.compute(index, w1, w2)
    
    ### Can't do this... Welds are off
    # merged_welds = self.df1[self.df1.feature == "WELD"]\
    #                    .merge(self.df2[self.df2.feature=="WELD"], on = 'id',
    #                           how = 'outer',indicator=True, suffixes=['_A', '_B'])
    # merged_welds['id_B'] = merged_welds['id']
    # merged_welds = merged_welds.rename(columns={'id':'id_A'})
    # merged_welds['match_score'] = ""
  
  def build_index(self):
    df1_features = self.df1[self.df1.feature != 'WELD']
    df2_features = self.df2[self.df2.feature != 'WELD']
    indexer = recordlinkage.Index()
    indexer.block(on=['feature', 'pipe_section'])
    index = indexer.index(df1_features, df2_features)
  
  ### remove when orientation doesn't match
  def normalize_orientation(self):
    '''
    orientation is usually off between the runs by a set amount.
    discover what that is and adjust the first runs to match the second
    Also: find a fixed value that can be compared between the two sides
    '''
    pass
    
  def normalize_wheelcount(self):
    '''
    See if we can discover a fixed wheelcount differential between the two runs to determine which is which
    '''  
  
  def load_datasets(self):
    pass
    
  def validate_datasets(self):
    ### todo check same number of welds and ids
    ### If not - seperate unmached weld sections
    pass
    
  def match_features(self):
    pass
    
  def gen_index(self):
    pass
    
  def check_index(self, index):
    ### TODO - get index 
    primary_index, secondary_index = [index.names[0], index.names[1]]
    joined = self.df1.loc[index.get_level_values(primary_index)].reset_index().\
                join(self.df2.loc[index.get_level_values(secondary_index)].reset_index(), 
                     lsuffix='_{}'.format(primary_index), rsuffix='_{}'.format(secondary_index)
                     )  
    return(joined)
  
  ### Generate comparison dataset
  def gen_comparison(results):
    results = results.iloc[:,-1].to_frame().join(self.df1,how='inner').join(self.df2, how='inner', lsuffix='_A', rsuffix='_B')
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
    
  def get_non_matches(self, matches, weld=True):
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
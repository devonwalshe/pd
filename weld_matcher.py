import sys, os, time, traceback, recordlinkage
from _logging import timed, logger
import pandas as pd
import numpy as np

class WeldMatcher(object):
  
  def __init__(self, df1, df2, coord_match=False):
    # self.matched_welds = self.match_welds(w1, w2, coord_match)
    self.w1 = df1[df1.feature == "WELD"]
    self.w2 = df2[df2.feature == "WELD"]
    self.coord_match = coord_match
    
  @timed(logger)
  def match_welds(self):
    if self.coord_match:
      matched_welds = self.coord_matcher(self.w1, self.w2)
    else:
      matched_welds = self.backtrack_matcher(self.w1, self.w2)
    return(matched_welds)
    
  def coord_matcher(self, w1, w2):
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
    matched_welds = self.join_from_index(w1, w2, matches.index)
    return(matched_welds)
    
  def backtrack_matcher(self, w1, w2):
    '''
    Main controller for a pigrun without co-ordinates
    '''
    ### Set up initial matched welds
    w1, w2 = (w1.reset_index().reset_index(), w2.reset_index().reset_index())
    matched_welds = [[w1.loc[[0]]], [w2.loc[[0]]]]

    try:
      ### Anchor iteration on left match, step forwards
      start = time.time()
      ### Set iteration count
      n = w1.shape[0]
      ### match welds sequentially until they don't agree with eachother
      while matched_welds[0][-1].iat[-1, 0] + 1 <  n:
        ### update matched welds and decide whether to continue
        step, matched_welds = self.step_match(w1, w2, matched_welds)
        ### Backtrack loop
        if not step:
          ### Backtrack from nearest short weld
          step, matched_welds = self.backtrack(w1, w2, matched_welds)
      ### Generate dfs
      matched_welds_a = pd.concat(matched_welds[0])
      matched_welds_b = pd.concat(matched_welds[1])
      ### Build multindex
      idx = pd.MultiIndex.from_frame(pd.concat([matched_welds_a.A.reset_index(drop=True), 
                                                matched_welds_b.B.reset_index(drop=True)], axis=1))
      ### set welds back up
      w1.index, w2.index = (w1.A, w2.B)
      w1, w2 = (w1.drop(['index', 'A'], axis=1), w2.drop(['index', 'B'], axis=1))
      ### Join Dfs
      matched_welds = self.join_from_index(w1,w2,idx)
      ### Return
      return(matched_welds)
      
    except:
      print("\n\n"+str(time.time() - start))
      print(sys.exc_info())
      traceback.print_tb(sys.exc_info()[2])

  def step_match(self, w1, w2, matched_welds, reverse=False):
    ''' Take last index of matched welds, and step forwards
        On the basis that the pipe length or upstream weld is roughly equal (check coord match to verify this)
        If right side doesn't match, return None
    '''
    ### Set up our comparisons
    if reverse:
      a2, b2 = (w1.iloc[[matched_welds[0][0].iat[0, 0] - 1]], 
                      w2.iloc[[matched_welds[1][0].iat[0, 0] - 1]])
    else:
      a2, b2 = (w1.iloc[[matched_welds[0][-1].iat[-1, 0] + 1]], 
                      w2.iloc[[matched_welds[1][-1].iat[-1, 0] + 1]])
    ### Compare joint lengths - NOTE - in test dataset largest absolute difference was .481 
    #### as a % of mean of the joint lengths, it was .22
    if abs(a2.joint_length.item() - b2.joint_length.item()) < .5:
      ### TODO.- update this so backtracking uses US weld distance instead of pipe length
      if reverse:
        ### Prepend new weld to start of matched welds
        matched_welds = [[a2] + matched_welds[0], [b2] + matched_welds[1]]
      else:
        ### Append new weld to end of matched welds
        matched_welds = [matched_welds[0] + [a2], matched_welds[1] + [b2]]
      return(True, matched_welds)
    else:
      print('\n Mismatched welds - backtracking')
      return(False, matched_welds)
    
    
  def backtrack(self, w1, w2, matched_welds):
    '''
    Alternate matching methodology - find nearest short weld, move backwards, updating matched welds as we go.  
    '''
    ### First short weld on A
    short_weld_a = w1[(w1.index > matched_welds[0][-1].iat[-1, 0]) & (w1.joint_length < 40)].iloc[[0]]
    ### Matching short weld on B
    short_weld_b = w2[(w2.index > matched_welds[1][-1].iat[-1, 0]) & 
                      (w2.joint_length.between(short_weld_a.joint_length.item() - .5, 
                                               short_weld_a.joint_length.item() + .5))].iloc[[0]]
    backtrack_welds = [[short_weld_a], [short_weld_b]]
    ### Fill it up backwards until step returns False
    step = True
    while step:
      step, backtrack_welds = self.step_match(w1, w2, backtrack_welds, reverse=True)
    ### When it breaks, append our welds to matched welds, and return
  
    matched_welds = [matched_welds[0] + backtrack_welds[0], matched_welds[1] + backtrack_welds[1]]
    return(True, matched_welds)

  def join_from_index(self, df1, df2, index):
    '''
    Sets up comparison dataset from index
    '''
    primary_index, secondary_index = [index.names[0], index.names[1]]
    joined = df1.loc[index.get_level_values(primary_index)].reset_index().\
                      join(df2.loc[index.get_level_values(secondary_index)].reset_index(), 
                           lsuffix='_{}'.format(primary_index), rsuffix='_{}'.format(secondary_index)
                           )
    return(joined)
from pr import PigRun
from pr_matcher import PigRunMatcher


def __main__():
  pr1 = PigRun().init_run('data/case_1_2014.xlsx', "A")
  df1 = pr1.init_df
  pr2 = PigRun().init_run('data/case_1_2019.xlsx', "B")
  df2 = pr2.init_df
  
  matcher = PigRunMatcher(pr1, pr2)
  
  
  
  pass
### SKETCHPAD ###


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


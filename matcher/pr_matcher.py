import recordlinkage
import pandas as pd
import numpy as np
from math import sin, cos, atan2, asin, radians, degrees
from _logging import logger, timed

from matcher.conf import mappings
from matcher.weld_matcher import WeldMatcher

### Organise the work
class PigRunMatcher(object):

  def __init__(self, pr1, pr2, feature_mapping, conf):
    self.pr1 = pr1
    self.pr2 = pr2
    self.df1 = pr1.init_df
    self.df2 = pr2.init_df
    self.feature_mapping = feature_mapping
    self.conf = conf
    self.coord_match = conf['coordinates_match']
    self.matched_welds = None

  @timed(logger)
  def match_runs(self):
    ### Normalise wheel counts
      ### TODO ?
    ### Step one - match welds and update original dataframes
    matched_welds = WeldMatcher(self.df1, self.df2, self.feature_mapping, self.conf).match_welds()
    ### Step two - add match information to datasets, and rematch welds so we have the right ids
    self.map_runs(matched_welds)
    matched_welds = WeldMatcher(self.df1, self.df2, self.feature_mapping, self.conf).match_welds()
    ### Step three - match features
    matched_features = self.match_features()
    ### Step four - assemble final dataset
    runs_joined = self.assemble_data(matched_welds,matched_features)
    ### Get rid of the unhelpful NaN objects
    runs_joined = runs_joined = runs_joined.where(pd.notnull(runs_joined), None)
    ### Return
    return(runs_joined)


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
    self.df1[['us_weld_id']] = a_mapper[['id_A']]
    self.df2[['us_weld_id']] = b_mapper[['id_B']]
    ### Calculate new weld distances
    self.df1 = self.pr1.calculate_weld_distance(self.df1)
    self.df2 = self.pr2.calculate_weld_distance(self.df2)
    ### Add sorting ids
    self.df1 = self.pr1.add_sort_ids(self.df1)
    self.df2 = self.pr2.add_sort_ids(self.df2)
    ### update the final weld
    self.df1.loc[self.df1.pipe_section == -1, "pipe_section"] = max(self.df1.pipe_section) + 1
    self.df2.loc[self.df2.pipe_section == -1, "pipe_section"] = max(self.df2.pipe_section) + 1


  @timed(logger)
  def match_features(self):
    '''
    Match features from the shared pipe sections
    '''
    ### Subset dfs into features
    f1 = self.df1[self.df1.feature!='WELD']
    f2 = self.df2[self.df2.feature!='WELD']
    ### Set up comparison
    if self.coord_match:
      ### Match scores
      coord_matches = self.coordinate_match(f1, f2)
      ### Assemble
      matched_features = self.join_from_index(coord_matches.index)
    else:
      ### Get match scores
      fixed_features = self.match_fixed_features(f1, f2)
      metal_loss = self.match_metal_loss(f1, f2)
      ### Assemble datasets
      fixed_matches = self.join_from_index(fixed_features.index)
      metal_matches = self.join_from_index(metal_loss.index)
      ### Concatenate
      matched_features = pd.concat([fixed_matches, metal_matches])

    ### Return
    return(matched_features)

  def coordinate_match(self, f1, f2):
    '''
    Matches based on haversine distance of features
    '''
    comp = recordlinkage.Compare()
    comp.numeric('h_dist', 'h_dist', method='squared', missing_value=np.NaN, scale=.000025)
    comp.numeric('us_weld_dist_coord_m', 'us_weld_dist_coord_m', method='gauss', scale=.02)
    comp.geo('lat', 'lng', 'lat', 'lng', method='squared', scale = .00005)
    ### set up index
    indexer = recordlinkage.Index()
    indexer.block(on=['feature_category', 'pipe_section'])
    index = indexer.index(f1, f2)
    ### Match pairs
    results = comp.compute(index, f1, f2)
    results['match_score'] = results.iloc[:,0:results.shape[1]].mean(axis=1)
    ### Get matches above 99 and take top ones where there are multiple
    matches = results[results['match_score'] >= .98]
    matches = matches[matches.groupby('A')['match_score'].transform(max) == matches['match_score']]
    return(matches)

  def match_fixed_features(self, f1, f2):
    '''
    Matches all the fixed features that arn't mill anomalies or metal loss
    '''
    ### Set up datasets
    ff1, ff2 = (f1[f1.feature_category != "metal loss / mill anomaly"],
                f2[f2.feature_category != "metal loss / mill anomaly"])
    ### Set up index
    indexer = recordlinkage.Index()
    indexer.block(on=['feature', 'pipe_section'])
    index = indexer.index(ff1, ff2)
    ### Set up comparison
    comp = recordlinkage.Compare()
    comp.numeric('us_weld_dist_wc_ft', 'us_weld_dist_wc_ft')
    comp.exact('feature_category', 'feature_category', missing_value=.75)
    ### Compute
    results = comp.compute(index, ff1, ff2)
    ### Gen match score TODO - improve here
    results['match_score'] = results.iloc[:,0:results.shape[1]].mean(axis=1)
    ### Get matches above N and take top ones where there are multiple
    matches = results[results['match_score'] >= self.conf['feature_match_threshold']]
    matches = matches[matches.groupby('A')['match_score'].transform(max) == matches['match_score']]
    matches = matches[matches.groupby('B')['match_score'].transform(max) == matches['match_score']]

    return(matches)

  def match_metal_loss(self, f1, f2):
    '''
    Matches metal loss and mill anomalies
    '''
    ### Set up datasets
    mlma1, mlma2 = (f1[f1.feature_category == "metal loss / mill anomaly"],
                  f2[f2.feature_category == "metal loss / mill anomaly"])
    ### Set up index
    indexer = recordlinkage.Index()
    indexer.block(on=['feature_category', 'pipe_section'])
    index = indexer.index(mlma1, mlma2)
    ### Set up comparison
    comp = recordlinkage.Compare()
    comp.numeric('us_weld_dist_wc_ft', 'us_weld_dist_wc_ft')
    comp.numeric('orientation_x', 'orientation_x', scale=15)
    comp.numeric('orientation_y', 'orientation_y', scale=15)
    results = comp.compute(index, mlma1, mlma2)
    ### Gen match score
    results['match_score'] = results.iloc[:,0:results.shape[1]].mean(axis=1)
    ### Get matches above N and take top ones where there are multiple
    matches = results[results['match_score'] >= self.conf['metal_loss_match_threshold']]
    matches = matches[matches.groupby('A')['match_score'].transform(max) == matches['match_score']]
    matches = matches[matches.groupby('B')['match_score'].transform(max) == matches['match_score']]

    return(matches)

  ## FIXME - make sure we need this - I don't think we do...
  def normalise_wc(self, df1, df2):
    '''
    Take validated features per pipe section, and normalize wheel count based on fitting those
    '''
    pass

  ### TODO
  def normalize_orientation(self):
    '''
    orientation is usually off between the runs by a set amount.
    discover what that is and adjust the first runs to match the second
    Also: find a fixed value that can be compared between the two sides
    '''
    pass

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

  @timed(logger)
  def assemble_data(self, matched_welds, matched_features):
    '''
    Takes matched welds and features, subsets the df into unmatched, and matched welds / features
    organises the columns, and joines them together
    '''
    keep_columns = ['id_A', 'wc_A', 'feature_A', 'wt_A', 'depth_in_A', 'length_in_A', 'width_A',
                   'pressure_1_A', 'pressure_2_A', 'joint_length_A', 'lat_A', 'lng_A', 'comments_A',
                   'us_weld_id_A', 'us_weld_dist_coord_m_A', 'us_weld_dist_wc_ft_A', 'h_dist_A', 'orientation_x_A',
                   'orientation_y_A', 'id_B', 'wc_B', 'feature_B', 'us_weld_dist_B', 'wt_B', 'depth_B',
                   'length_B', 'width_B', 'orientation_B', 'pressure_1_B', 'pressure_2_B', 'joint_length_B', 'lat_B',
                   'lng_B', 'comments_B', 'us_weld_id_B', 'us_weld_dist_coord_B', 'us_weld_dist_wc_B', 'h_dist_B',
                   'orientation_x_B', 'orientation_y_B', 'pipe_section', 'section_sequence']

    ### FIXME so this is included in the run match conf
    output_cols = {'dup_cols': ['id','feature','wc','wt','depth_in','length_in',
                                'width_in','joint_length','pressure_1',
                                'pressure_2','us_weld_dist_wc_ft',
                                'orientation_deg','orientation_x','orientation_y',
                                'comments','feature_category'],
                    'sort_cols': ['pipe_section', 'section_sequence']}

    ### Try keep with output from mapping
    keep_columns = [x + "_A" for x in output_cols['dup_cols']] + [x + "_B" for x in output_cols['dup_cols']] + output_cols['sort_cols']

    ### Organised unmatched
    unmatched_A = self.df1.drop(pd.concat([matched_welds.A, matched_features.A]))
    unmatched_B = self.df2.drop(pd.concat([matched_welds.B, matched_features.B]))
    empty_A, empty_B = (pd.DataFrame(None, index=unmatched_A.index, columns = self.df1.columns),
                        pd.DataFrame(None, index=unmatched_B.index, columns = self.df2.columns))
    joined_A, joined_B = (unmatched_A.join(empty_A, lsuffix="_A", rsuffix='_B'),
                          empty_B.join(unmatched_B, lsuffix = "_A", rsuffix="_B"))
    unmatched = pd.concat([joined_A, joined_B]).reset_index()
    section = pd.concat([unmatched[unmatched.pipe_section_A.notnull()].pipe_section_A,
                        unmatched[unmatched.pipe_section_B.notnull()].pipe_section_B]).to_list()
    sequence = pd.concat([unmatched[unmatched.section_sequence_A.notnull()].section_sequence_A,
                         unmatched[unmatched.section_sequence_B.notnull()].section_sequence_B]).to_list()
    unmatched[['pipe_section', 'section_sequence']] = pd.DataFrame([section, sequence], dtype="object").transpose()
    ### Organise matched welds
    matched_welds[['pipe_section',
                   'section_sequence']] = pd.concat([matched_welds['pipe_section_A'],
                                                     pd.Series([-1 for i in range(matched_welds.shape[0])])], axis=1)
    ### Organise matched features
    matched_features[['pipe_section', 'section_sequence']] = matched_features[['pipe_section_A', 'section_sequence_A']]
    ### Normalise columns
    unmatched, matched_welds, matched_features = (unmatched[keep_columns],
                                                 matched_welds[keep_columns],
                                                 matched_features[keep_columns])
    ### Bind together and sort
    runs_joined = pd.concat([matched_welds, matched_features, unmatched])
    runs_joined = runs_joined.sort_values(['pipe_section', 'us_weld_dist_wc_ft_B', 'section_sequence'])
    ### return
    return(runs_joined)


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
    subset the missing items from the match and return lists of each
    '''
    matched_df = self.df1.iloc[matches.index.get_level_values("A")].reset_index()\
                         .join(self.df2.iloc[matches.index.get_level_values("B")].reset_index(), lsuffix="_A", rsuffix="_B")
    if weld:
      missing_a = set(matched_welds.id_A.to_list()).symmetric_difference(set(df1[df1.feature=='WELD'].id.to_list()))
      missing_b = set(matched_welds.id_B.to_list()).symmetric_difference(set(df2[df2.feature=='WELD'].id.to_list()))
    else:
      missing_a = set(matched_welds.id_A.to_list()).symmetric_difference(set(df1[df1.feature!='WELD'].id.to_list()))
      missing_b = set(matched_welds.id_B.to_list()).symmetric_difference(set(df2[df2.feature!='WELD'].id.to_list()))
    return(missing_a, missing_b)

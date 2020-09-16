### Lib imports
import pandas as pd
import numpy as np
import re
### House imports
from _logging import timed, logger
### API models
from api.models.models import *

class MatchExporter(object):

  def __init__(self, run_match):
    self.rm = run_match
    self.output_cols = ['id', 'feature', 'wc', 'wt', 'depth_in', 'length_in',
                        'width_in', 'joint_length', 'pressure_1', 'pressure_2',
                        'us_weld_dist_wc_ft', 'orientation_deg', 'orientation_x',
                        'orientation_y', 'comments', 'feature_category']

  @timed(logger)
  def assemble_data(self):
    ### normalise columns
    cols = [c+"_A" for c in self.output_cols] + \
           [c+"_B" for c in self.output_cols] + \
           ["pipe_section", "section_sequence"]
    ### Get welds, matched and unmatched_features
    welds, matched_features, unmatched_features = (self.get_welds(),
                                                   self.get_matched_features(),
                                                   self.get_unmatched_features())
    ### Normalise cols
    welds, matched_features, unmatched_features = (welds[cols],
                                                   matched_features[cols],
                                                   unmatched_features[cols])
    ### Join
    joined = pd.concat([welds, matched_features, unmatched_features])
    ### Sort
    joined_sorted = joined.sort_values(['pipe_section', 'section_sequence'])
    ### to csv
    csv_text = joined_sorted.to_csv()
    return(csv_text)

  @timed(logger)
  def get_welds(self):
    '''
    Matched welds
    '''
    ### Get the weld pairs
    weld_pairs = [wp for wp in self.rm.weld_pairs]
    dict_list = []
    ### Iterate through the pairs
    for i in range(len(weld_pairs)):
      ### Set up welds from DB
      weld_a, weld_b = (model_to_dict(Weld.get_by_id(weld_pairs[i].weld_a), recurse=False),
                        model_to_dict(Weld.get_by_id(weld_pairs[i].weld_b), recurse=False))
      ### merge feature cols into welds
      weld_a, weld_b = ({**{k:None for k in self.output_cols if k not in weld_a.keys()}, **weld_a},
                        {**{k:None for k in self.output_cols if k not in weld_b.keys()}, **weld_b})
      ### Normalise column names
      weld_a.update({"wc": weld_a['wheel_count'], "wt":weld_a['wall_thickness'], "id":weld_a['weld_id']})
      weld_b.update({"wc": weld_b['wheel_count'], "wt":weld_b['wall_thickness'], "id":weld_b['weld_id']})
      ### Update pipe_section
      pipe_section, section_sequence = (weld_a['pipe_section'], weld_a['section_sequence'])
      pipe_section = re.search(r"[0-9]+$", pipe_section)[0]
      weld_a, weld_b = ({k:v for k,v in weld_a.items() if k not in ['pipe_section', 'section_sequence']},
                        {k:v for k,v in weld_b.items() if k not in ['pipe_section', 'section_sequence']})
      ### Join them horizontally
      wp = {**{k+"_A":v for k,v in weld_a.items()}, **{k+"_B":v for k,v in weld_b.items()}}
      wp = {**wp, **{"pipe_section":pipe_section, "section_sequence":section_sequence} }
      dict_list.append(wp)
    ### Generate the df
    welds_df = pd.DataFrame(dict_list)
    ### Fix pipe section


    ### Return
    return(welds_df)

  @timed(logger)
  def get_matched_features(self):
    '''
    Matched features
    '''
    ### Get feature pairs
    fps = [fp for fp in self.rm.feature_pairs]
    ### Iterate through and prepare the dfs
    feature_dicts = []
    for i in range(len(fps)):
      feature_a, feature_b = (Feature.get_by_id(fps[i].feature_a),
                              Feature.get_by_id(fps[i].feature_b))
      ### Get feature a and b from DB
      fa_a, fa_b = ({fa['attribute_name'] : fa['attribute_data'] for fa in \
                               feature_a.attrs_serialized() if fa['attribute_name'] not in ['pipe_section', 'section_sequence']},
                              {fa['attribute_name'] : fa['attribute_data'] for fa in \
                               feature_b.attrs_serialized() if fa['attribute_name'] not in ['pipe_section', 'section_sequence']})
      ### Add id
      f_a, f_b = ({**{"id": feature_a.feature_id}, **fa_a},
                              {**{"id": feature_b.feature_id}, **fa_b})
      ### Set up row
      fp = {**{k+"_A":v for k,v in f_a.items()}, **{k+"_B":v for k,v in f_b.items()}}
      ### Add pipe section and sequence (NOTE - selecting the right sides pipe section and sequence here! not original)
      pss = {"pipe_section": re.search("\d+$", feature_b.pipe_section.section_id)[0], "section_sequence":feature_b.section_sequence}
      fp = {**fp, **pss}
      ### Append to list
      feature_dicts.append(fp)
    ### Make df from list
    matched_df = pd.DataFrame(feature_dicts)
    return(matched_df)

  @timed(logger)
  def get_unmatched_features(self):
    ### Get rm features and fps
    fps = [fp for fp in self.rm.feature_pairs]
    fs = [fp for fp in self.rm.features]
    ### remove features that have pairs
    fps_ids = [f.feature_a_id for f in fps] + [f.feature_b_id for f in fps]
    fa, fb = ([f for f in Feature.select().where((Feature.side=="A") & \
                                                 (Feature.id.not_in(fps_ids)) & \
                                                 (Feature.run_match == self.rm))],
              [f for f in Feature.select().where((Feature.side=="B") & \
                                                 (Feature.id.not_in(fps_ids)) & \
                                                 (Feature.run_match == self.rm))])
    ### line them up left and right with blanks
    dict_rows = []
    sides = [fa, fb]
    for i in range(len(sides)):
      for feature in sides[i]:
        ### Set up cols
        onside, offside = ("A", "B") if i == 0 else ("B", "A")
        ### Set up data side
        attrs = {**{'id_{}'.format(onside): feature.feature_id}, **{fattr['attribute_name']+"_{}".format(onside) : fattr['attribute_data'] for fattr in \
                                 feature.attrs_serialized() if fattr['attribute_name'] not in ['pipe_section', 'section_sequence']} }
        ### update pipe section
        pps = {"pipe_section": re.search("\d+$", feature.pipe_section.section_id)[0], "section_sequence":feature.section_sequence}
        ### Set up offside
        offside_dict = {key+"_{}".format(offside): None for key in self.output_cols}
        ### Join the dicts
        joined = {**attrs, **offside_dict, **pps}
        dict_rows.append(joined)
    ### Turn it into a df
    unmatched_df = pd.DataFrame(dict_rows)
    return(unmatched_df)

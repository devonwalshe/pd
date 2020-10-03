### Lib imports
import pandas as pd
import numpy as np
import re, os
### API models
from api.models.models import *
### House imports
from matcher.weld_matcher import WeldMatcher
from matcher.pr import PigRun
from matcher.pr_matcher import PigRunMatcher
from _logging import timed, logger

### TODO - fix features to get rid of this
from matcher.conf import mappings
mapping = mappings['wc']

db = PostgresqlDatabase('pd', user=re.match("[^\n].*", subprocess.check_output('whoami').decode())[0], host='localhost', port=5432, autorollback=True)

### Tasks
class MatchRunnerUtil(object):

  def __init__(self, run_match):
    self.run_match = run_match

  def update_progress(self, data):
    pass

  @timed(logger)
  def run(self):
    matched_data = self.launch_matcher()
    print("match run")
    result = self.save_run_objects(matched_data)
    print("match saved")
    return(result)

  @timed(logger)
  def launch_matcher(self):
    ### Receive run match
    rm = self.run_match

    ### Get mappings
    mapping_a, mapping_b = (rm.run_a.raw_file.data_mapping.mappings_serialized,
                            rm.run_b.raw_file.data_mapping.mappings_serialized)
    ### Get CSV files (from storage)- TEMP from local file
    csv_a, csv_b = (rm.run_a.raw_file.file_url,
                    rm.run_b.raw_file.file_url)
    ### Set up conf
    conf = model_to_dict(rm.conf, recurse=False)
    ### Set up our pr's
    pr1, pr2 = (PigRun().init_run(path=csv_a, feature_mapping=mapping_a,
                                  conf=model_to_dict(rm.conf), label="A",
                                  sheet_name=rm.run_a.raw_file.sheet_name),
                PigRun().init_run(path=csv_b, feature_mapping=mapping_b,
                                  conf=model_to_dict(rm.conf), label="B",
                                  sheet_name=rm.run_b.raw_file.sheet_name))
    ### Matcher
    matcher = PigRunMatcher(pr1, pr2, mapping_a, conf)
    matched_data = matcher.match_runs()
    ### update progress
    self.update_progress({"state":"Match Complete"})
    ### return
    return(matched_data)

  def save_run_objects(self, matched_data):
    '''
    Utility function to save data into the database
    '''
    ### Pipe sections
    if self.save_pipe_sections(matched_data, self.run_match):
      self.update_progress({})
    ### Welds
    if self.save_welds(matched_data, self.run_match):
      self.update_progress({})
    ### Features
    if self.save_features(matched_data, self.run_match):
      self.update_progress({})
    return(True)

  @timed(logger)
  def save_pipe_sections(self, matched_data, rm):
    ### Set up pipe sections
    pipe_sections = [PipeSection(section_id = "{}_{}".format(rm.id, ps), run_match=rm, manually_checked=False) for ps in set(matched_data.pipe_section)]
    with db.atomic():
      PipeSection.bulk_create(pipe_sections, batch_size=100)
    return(True)

  @timed(logger)
  def save_welds(self, matched_data, rm):
    ### Set up records for Welds
    welds_a = [Weld(weld_id = int(row['id_A']),
                    pipe_section = "{}_{}".format(rm.id, row['pipe_section']),
                    section_sequence=row['section_sequence'],
                    run_match=rm,
                    wheel_count=row['wc_A'],
                    side="A",
                    us_weld_dist = row['us_weld_dist_wc_ft_A'],
                    us_weld_unit = 'ft',
                    joint_length = row['joint_length_A'],
                    wall_thickness = row['wt_A']) \
               for idx, row in matched_data[(matched_data['feature_A'] == "WELD") & (matched_data['feature_B'] == "WELD")].iterrows()]
    welds_b = [Weld(weld_id = int(row['id_B']),
                    pipe_section = "{}_{}".format(rm.id, row['pipe_section']),
                    section_sequence=row['section_sequence'],
                    run_match=rm,
                    wheel_count=row['wc_B'],
                    side="B",
                    us_weld_dist = row['us_weld_dist_wc_ft_B'],
                    us_weld_unit = 'ft',
                    joint_length = row['joint_length_B'],
                    wall_thickness = row['wt_B']) \
               for idx, row in matched_data[(matched_data['feature_A'] == "WELD") & (matched_data['feature_B'] == "WELD")].iterrows()]

    with db.atomic():
      Weld.bulk_create(welds_a, batch_size=100)
      Weld.bulk_create(welds_b, batch_size=100)

    pairs = [a for a in zip(welds_a, welds_b)]
    weld_pairs = [WeldPair(weld_a=pair[0], weld_b=pair[1], run_match=rm) for pair in pairs]
    with db.atomic():
      WeldPair.bulk_create(weld_pairs, batch_size=100)
    return(True)

  @timed(logger)
  def save_features(self, matched_data, rm):
    ### Set up features
    a_cols = [c for c in matched_data.columns.to_list() if "_A" in c] + ['pipe_section', 'section_sequence']
    b_cols = [c for c in matched_data.columns.to_list() if "_B" in c] + ['pipe_section', 'section_sequence']
    ### Iterate through all the matched data
    fs_a, fas_a, fs_b, fas_b, f_ps = ([],[],[],[],[])
    for idx, row in matched_data[(matched_data['feature_A'] != "WELD") & (matched_data['feature_B'] != "WELD")].iterrows():
      row_a = row[a_cols]
      row_b = row[b_cols]
      feature_a = Feature(feature_id = row_a['id_A'],
                          pipe_section="{}_{}".format(rm.id, row_a['pipe_section']),
                          section_sequence=row_a['section_sequence'],
                          ml_ma = row_a['feature_category_A'] == "metal loss / mill anomaly",
                          run_match = rm,
                          side="A")
      feature_b = Feature(feature_id = row_b['id_B'],
                          pipe_section="{}_{}".format(rm.id, row_a['pipe_section']),
                          section_sequence=row_b['section_sequence'],
                          ml_ma = row_b['feature_category_B'] == "metal loss / mill anomaly",
                          run_match = rm,
                          side="B")
      ### If a feature has an ID - save it
      left = feature_a.feature_id is not None
      right = feature_b.feature_id is not None
      both = left & right
      if left:
        feature_a.feature_id = int(feature_a.feature_id)
        feature_a.save()
        # feature_a.save()
      if right:
        feature_b.feature_id = int(feature_b.feature_id)
        feature_b.save()
        # feature_b.save()
      ### if both have IDS
      if both:
        fp = FeaturePair(feature_a = feature_a, feature_b = feature_b, run_match = rm, pipe_section=feature_a.pipe_section)
        f_ps.append(fp)
      ### Set up potential feature attributes
      mapping = {'feature':"str",
                 'wc':'float',
                 'wt':'float',
                 'depth_in':'float',
                 'length_in':'float',
                 'width_in':'float',
                 'joint_length':'float',
                 'pressure_1':'float',
                 'pressure_2':'float',
                 'us_weld_dist_wc_ft':'float',
                 'us_weld_dist_coord_m':'float',
                 'h_dist':'float',
                 'orientation_deg':'int',
                 'orientation_x':'float',
                 'orientation_y':'float',
                 'lat':'float',
                 'lng':'float',
                 'comments':'str',
                 'feature_category':'str',
                 'pipe_section':'int',
                 'section_sequence':'int'}
      ### remove feature attributes that aren't in matched data
      keep_cols = set([re.sub("_A|_B", "", c) for c in matched_data.columns.to_list()])
      mapping = {k:v for k, v in mapping.items() if k in keep_cols}
      for k, v in mapping.items():
        ### Set up feature attribute for a and b
        if k not in ["pipe_section", 'section_sequence']:
          data_a = row[k+"_A"]
          data_b = row[k+"_B"]
        else:
          data_a = row[k]
          data_b = row[k]
        if left:
          fa_a = FeatureAttribute(feature = feature_a, attribute_name = k, attribute_datatype=v, attribute_data = data_a)
          fas_a.append(fa_a)
        if right:
          fa_b = FeatureAttribute(feature = feature_b, attribute_name = k, attribute_datatype=v, attribute_data = data_b)
          fas_b.append(fa_b)
    ### Pull them and return
    with db.atomic():
      # Feature.bulk_create(fs_a+fs_b, batch_size=1000)
      FeaturePair.bulk_create(f_ps, batch_size=1000)
      FeatureAttribute.bulk_create(fas_a+fas_b, batch_size=1000)
    # features = Feature.select().where(Feature.run_match == rm)
    return(True)

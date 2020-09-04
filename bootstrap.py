### Bootstrap application data for PD
from peewee import *
from api.models.models import *
import pandas as pd
import numpy as np
import datetime, logging, math
logger = logging.getLogger('peewee')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)

from matcher.conf import mappings
mapping = mappings['wc']

db = PostgresqlDatabase('pd', user='azymuth', host='localhost', port=5432)

def bootstrap(drop=True):
  ### Set up database
  model_list = [Feature, FeatureAttribute, FeaturePair, Weld, WeldPair, \
                PipeSection, Pipeline, InspectionRun, RunMatch, \
                FeatureMapping, FeatureMap, RawFile, RunMatchConf]
  if drop:
    db.drop_tables(model_list)
  db.create_tables(model_list)
  fm = bootstrap_feature_mappings()
  raw_files = bootstrap_raw_files(fm)
  matched_data, rm = bootstrap_run_match(raw_files)
  pipe_sections = bootstrap_pipe_sections(matched_data, rm)
  rmc = bootstrap_run_match_conf(rm, fm)
  weld_pairs = bootstrap_welds(matched_data, rm)
  features = bootstrap_features(matched_data, rm, mapping)

def bootstrap_feature_mappings():
  fm, created = FeatureMap.get_or_create(mapping_name='wc', source_name="sample company")
  input_map = mapping['input_columns']
  datatypes = {'ID': 'string',
               'Wheel Count': 'float',
               'Feature': 'string',
               'Dist US Weld (ft)': 'float',
               'WT': 'float',
               'Depth': 'float',
               'Length (in)': 'float',
               'Width (in)': 'float',
               'Orientation (deg)': 'integer',
               'Pressure 1': 'float',
               'Pressure 2': 'float',
               'Joint Length': 'float',
               'Latitude': 'float',
               'Longitude': 'float',
               'Comments': 'string'}
  for raw,input in input_map.items():
    fmg = FeatureMapping.get_or_create(feature_map=fm, raw_col_name=raw, processing_col_name=input, datatype=datatypes[raw])
  # Return the feature map
  return(fm)


def bootstrap_raw_files(fm):
  ### Set up record for the raw files
  raw_files = ['data/case_1_2014.xls', 'data/case_1_2019.xlsx']
  for raw_file in raw_files:
    RawFile.create(filename=raw_file, file_url=raw_file, uploaded_at=datetime.datetime.now(), data_mapping = fm, source="company_x")
  raw_files = [rf for rf in RawFile.select().where(RawFile.data_mapping == fm)]
  return(raw_files)

def bootstrap_run_match(raw_files):
  ### Set up record for pipeline
  pipeline = Pipeline.create(name='Case 1')
  ### Set up record for each inspection run
  InspectionRun.create(raw_file = raw_files[0], run_date=datetime.datetime(2014,1,1), pipeline=pipeline)
  InspectionRun.create(raw_file = raw_files[1], run_date=datetime.datetime(2019,1,1), pipeline=pipeline)
  inspection_runs = [ir for ir in InspectionRun.select().where(InspectionRun.pipeline==pipeline)]
  ### Read match output file
  matched_data = pd.read_csv('data/output/matched_runs_coord_20200707_161051.csv')
  ### Set up record for Run Match
  rm = RunMatch.create(run_a = inspection_runs[0], run_b = inspection_runs[1], pipeline = pipeline,
                       section_count=matched_data.pipe_section.max() + 1, sections_checked=0, name = "2014_2019")
  ### Return
  return(matched_data, rm)

def bootstrap_run_match_conf(rm, fm):
  rmc = RunMatchConf.create(run_match=rm,
                      feature_map=fm,
                      coordinates_match=False,
                      short_joint_threshold=20,
                      short_joint_window=10,
                      short_joint_lookahead=75,
                      joint_length_difference=2,
                      backtrack_validation_lookahead=10,
                      feature_match_threshold=.98,
                      metal_loss_match_threshold=.60
                      )
  return(rmc)

def bootstrap_pipe_sections(matched_data, rm):
  ### Set up pipe sections
  pipe_sections = [PipeSection(section_id = "{}_{}".format(rm.id, ps), run_match=rm, manually_checked=False) for ps in set(matched_data.pipe_section)]
  with db.atomic():
    PipeSection.bulk_create(pipe_sections, batch_size=100)
  return(pipe_sections)


def bootstrap_welds(matched_data, rm):
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
  return(weld_pairs)


def bootstrap_features(matched_data, rm, mapping):
  ### Set up features
  a_cols = ["{}_A".format(col) for col in mapping['output_columns']['dup_cols']] + ['pipe_section', 'section_sequence']
  b_cols = ["{}_B".format(col) for col in mapping['output_columns']['dup_cols']] + ['pipe_section', 'section_sequence']
  ### Iterate through all the matched data
  for idx, row in matched_data[(matched_data['feature_A'] != "WELD") & (matched_data['feature_B'] != "WELD")].iterrows():
    print(idx)
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
    left = not math.isnan(feature_a.feature_id)
    right = not math.isnan(feature_b.feature_id)
    both = left & right
    if left:
      feature_a.feature_id = int(feature_a.feature_id)
      feature_a.save()
    if right:
      feature_b.feature_id = int(feature_b.feature_id)
      feature_b.save()
    ### if both have IDS
    if both:
        fp = FeaturePair(feature_a = feature_a, feature_b = feature_b, run_match = rm, pipe_section=feature_a.pipe_section)
        fp.save()
    ### Set up feature attributes
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
        fa_a.save()
      if right:
        fa_b = FeatureAttribute(feature = feature_b, attribute_name = k, attribute_datatype=v, attribute_data = data_b)
        fa_b.save()
  ### Pull them and return
  features = Feature.select().where(Feature.run_match == rm)
  return([f for f in features])



if __name__ == "__main__":
  bootstrap()

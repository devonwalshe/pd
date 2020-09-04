from peewee import *
from playhouse.shortcuts import model_to_dict, dict_to_model
db = PostgresqlDatabase('pd', user='azymuth', host='localhost', port=5432)

class FeatureMap(Model):
  '''
  Normalises attributes from a run's dataset for processing
  '''
  mapping_name = CharField()
  source_name = CharField()

  def mappings_serialized(self):
    mappings = self.mappings
    return([model_to_dict(mapping, recurse=False) for mapping in mappings])

  class Meta:
    database = db

class FeatureMapping(Model):
  '''
  Individual mapping for features
  '''
  feature_map = ForeignKeyField(FeatureMap, backref='mappings')
  raw_col_name = CharField()
  processing_col_name = CharField()
  datatype = CharField()

  class Meta:
    database = db


class RawFile(Model):
  '''
  Raw uploaded files
  '''
  filename = CharField()
  file_url = CharField()
  uploaded_at = DateTimeField(null=True)
  data_mapping = ForeignKeyField(FeatureMap, backref='files')
  source = CharField()

  ### Meta
  class Meta:
    database = db

class Pipeline(Model):
  '''
  A section of pipe that the inspection tool runs through
  '''
  name = CharField()

  class Meta:
    database = db

class InspectionRun(Model):
  '''
  A single run of an inspection tool
  '''
  raw_file = ForeignKeyField(RawFile, backref='run')
  run_date = DateTimeField()
  pipeline = ForeignKeyField(Pipeline, backref='inspection_runs')

  class Meta:
    database = db

class RunMatch(Model):
  '''
  Matches two runs
  '''
  # name = CharField()
  run_a = ForeignKeyField(InspectionRun, backref='match')
  run_b = ForeignKeyField(InspectionRun, backref='match')
  pipeline = ForeignKeyField(Pipeline, backref='match')
  section_count = IntegerField()

  name = CharField()

  @property
  def sections_checked(self):
    return(self.pipe_sections.where(PipeSection.manually_checked==True).count())

  @property
  def fm_a(self):
    return(self.run_a.raw_file.data_mapping)

  @property
  def fm_b(self):
    return(self.run_b.raw_file.data_mapping)

  class Meta:
    database = db


class PipeSection(Model):
  '''
  A section of pipe
  '''
  section_id = CharField(unique=True)
  run_match = ForeignKeyField(RunMatch, backref='pipe_sections')
  manually_checked = BooleanField()

  def feature_count(self):
    return(self.features.count())

  class Meta:
    database = db


class Weld(Model):
  '''
  Delineates pipe sections
  '''
  weld_id = CharField()
  pipe_section = ForeignKeyField(PipeSection, field='section_id', backref='weld')
  section_sequence = IntegerField()
  wheel_count = DoubleField()
  run_match = ForeignKeyField(RunMatch, backref = 'welds')
  side = CharField()
  us_weld_dist = DoubleField()
  joint_length = DoubleField()
  wall_thickness = DoubleField()

  def weld_pair(self):
    ### code to return the weld pair
    weld_pair_a = [wp for wp in self.weld_pair_a]
    weld_pair_b = [wp for wp in self.weld_pair_b]
    weld_pair = weld_pair_a + weld_pair_b
    return(weld_pair[0])

  class Meta:
    database = db

class WeldPair(Model):
  '''
  A matched pair of welds between two inspection runs
  '''
  weld_a = ForeignKeyField(Weld, backref='weld_pair_a')
  weld_b = ForeignKeyField(Weld, backref='weld_pair_b')
  run_match = ForeignKeyField(RunMatch, backref = 'weld_pairs')

  class Meta:
    database = db
    indexes = (
      ### multiple on all three
      (('weld_a', 'weld_b', 'run_match'), True),
    )

class Feature(Model):
  '''
  An observed object from the inspection tool
  '''
  feature_id = CharField()
  pipe_section = ForeignKeyField(PipeSection, field='section_id', backref='features')
  section_sequence = IntegerField()
  ml_ma = BooleanField() # is it metal loss / mill anomaly?
  run_match = ForeignKeyField(RunMatch, backref='features')
  side = CharField()

  def matched(self):
    if self.side=="A":
      fp = [fp for fp in FeaturePair.select().where(FeaturePair.feature_a == self.id)]
    else:
      fp = [fp for fp in FeaturePair.select().where(FeaturePair.feature_b == self.id)]
    if fp != []:
      return(True)
    else:
      return(False)

  def attrs_serialized(self):
    attrs = [model_to_dict(fa, recurse=False) for fa in self.attributes]
    return(attrs)

  def serialize(self):
    obj = {**model_to_dict(self, recurse=False), **{'matched': self.matched()}, **{'attributes': self.attrs_serialized()}}
    return(obj)

  class Meta:
    database = db

class FeatureAttribute(Model):
  '''
  An attribute field for each reading - dependent on the tool and supplier
  '''
  feature = ForeignKeyField(Feature, backref='attributes')
  attribute_name = CharField()
  attribute_datatype = CharField()
  attribute_data = CharField()

  class Meta:
    database = db

class FeaturePair(Model):
  '''
  A matched pair or set of features between two inspection runs
  '''
  feature_a = ForeignKeyField(Feature, backref='feature_pair')
  feature_b = ForeignKeyField(Feature, backref='feature_pair')
  run_match = ForeignKeyField(RunMatch, backref='feature_pairs')
  pipe_section = ForeignKeyField(PipeSection, backref='feature_pairs')

  class Meta:
    database = db

class MatcherRun(Model):
  '''
  Runner for the matcher
  '''
  run_match = ForeignKeyField(RunMatch, backref='matcher_run', unique=True)
  start_time = FloatField(null=True)
  end_time = FloatField(null=True)

  class Meta:
    database = db

class RunMatchConf(Model):
  '''
  All the configuration for a single run match
  '''
  run_match = ForeignKeyField(RunMatch, backref='conf', unique=True)
  feature_map = ForeignKeyField(FeatureMap, backref='run_matches', unique=True)
  coordinates_match = BooleanField()
  short_joint_threshold = IntegerField()
  short_joint_window = IntegerField()
  short_joint_lookahead = IntegerField()
  joint_length_difference = FloatField()
  backtrack_validation_lookahead = IntegerField()
  feature_match_threshold = FloatField()
  metal_loss_match_threshold = FloatField()

  class Meta:
    database = db

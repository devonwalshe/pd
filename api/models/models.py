from peewee import *
<<<<<<< Local Changes

### 
=======


>>>>>>> External Changes
class Feature(Model):
  '''
  An observed object from the inspection tool
  '''
  def __init__():
    
  pass
  
class FeaturePair(Model):
  '''
  A matched pair or set of features between two inspection runs
  '''
  pass
  
class PigRun(Model):
  '''
  A single run of an inspection tool
  '''
  pass
  
class Pipeline(Model):
  '''
  A section of pipe that the inspection tool runs through
  '''
  pass

class Weld(Model):
  '''
  Delineates pipe sections
  '''
  pass
  
class PipeSection(Model):
  '''
  A section of pipe
  '''
  pass
  
class RawFile(Model):
  '''
  Raw uploaded files
  '''
  pass
  

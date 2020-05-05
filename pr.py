import datetime, sys, logging
from functools import reduce
import pandas as pd
import numpy as np
from math import radians, cos, sin, asin, sqrt, atan2, degrees
from _logging import timed, logger

### Describes a PIG's run through a pipeline on a certain date
class PigRun(object):
  def __init__(self, path, run_label="A"):
    self.columns = ['id', 'wc', 'feature', 'us_weld_dist', 'wt', 'depth', 'length', 'width', 'orientation', 'pressure_1', 'pressure_2', 'joint_length', 'lat', 'lng', 'comments']
    self.path = path
    self.run_label = run_label
    self.raw_df = self.import_run()
    self.df = self.process_raw_df()
    pass
    
  def import_run(self):
    df = pd.read_excel(self.path, names=self.columns, sheet_name="Original")
    df.index.name = self.run_label
    return(df)
  
  def process_raw_df(self):
    '''
    processing pipeline for a pig run
    '''
    ### TODO - add some data cleaning - orientations etc
    processed_df = reduce(lambda result, function: function(result), (self.join_welds, self.calculate_weld_distance, 
                                                                      self.add_sort_ids, self.add_haversine), 
                                                   self.raw_df)
    return(processed_df)
  
  
  def get_welds(self, df):
    '''
    Iterates through all welds and retrieves the closest up and downstream ID
    '''
    widx = df[df.feature == "WELD"].index
    ids = []
    rows = df.shape[0]
    for i in range(0,rows):
      if i == 0: 
        us_weld = df.iloc[widx[widx >= i].min()].id
        ds_weld = np.NaN
      elif i == rows - 1:
        us_weld = np.NaN
        ds_weld = df.iloc[widx[widx <= i].max()].id
      else:
        us_weld = df.iloc[widx[widx >= i].min()].id
        ds_weld = df.iloc[widx[widx <= i].max()].id
      ids.append([ds_weld, us_weld])
    return(ids)
  
  @timed(logger)
  def join_welds(self, df):
    '''
    join weld position and subtract from feature position to get distance from upstream weld
    '''
    welds = pd.DataFrame(self.get_welds(df), columns=['ds_weld_id', 'us_weld_id'])
    welds = welds.astype('object')
    
    return(df.join(welds, how='left'))

  def calculate_weld_distance(self, df):
    '''
    join weld position and subtract from feature position to get distance from upstream weld
    '''
    us_weld_join = df.merge(df[(df.feature == "WELD")][['id','wc']], left_on='us_weld_id', right_on='id', how='left')
    ds_weld_join = df.merge(df[(df.feature == "WELD")][['id','wc']], left_on='ds_weld_id', right_on='id', how='left')
    df['us_weld_dist'] = us_weld_join['wc_y'] - us_weld_join['wc_x']
    df['ds_weld_dist'] = us_weld_join['wc_x'] - ds_weld_join['wc_y']
    return(df)
  
  @timed(logger)  
  def add_haversine(self, df):
    origin_lat, origin_lng = self.gen_origin(df)
    df['h_dist'] = [self.calculate_haversine_dist(origin_lng, origin_lat, lng, lat) for lng, lat in zip(df.lng, df.lat)]
    return(df)
  
  def gen_origin(self, df):
    ### Get lat and long of start and end point
    ll1 = df.iloc[0][['lat', 'lng']]
    ll2 = df.iloc[-1][['lat', 'lng']]
    ### Calculate bearing and distance
    compass_bearing, reverse_bearing = self.calculate_bearing(ll1, ll2)
    hdist = self.calculate_haversine_dist(ll1.lng, ll1.lat, ll2.lng, ll2.lat)
    ### set origin to 10 times the length of the pipeline in the opposite direction
    d = hdist*5
    r = 6378
    b = radians(reverse_bearing)
    lat1, lng1 = (radians(ll1.lat), radians(ll1.lng))
    lat2 = asin(sin(lat1) * cos(d/r) + 
                cos(lat1) * sin(d/r) * cos(b))
    
    lng2 = lng1 + atan2(sin(b) * sin(d/r) * cos(lat1),
                        cos(d/r) - sin(lat1) * sin(lat2))
    ### Convert these to degrees
    lat2 = degrees(lat2)
    lng2 = degrees(lng2)
    return(lat2,lng2)
  
  def calculate_bearing(self, ll1, ll2):
    '''
    Get simple bearing of the pipeline

    The formulae used is the following:
        θ = atan2(sin(Δlong).cos(lat2),
                  cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong))
    '''
    lat1 = radians(ll1.lat)
    lat2 = radians(ll2.lat)
    ### difference between long values (N/S)
    diffLong = radians(ll2.lng - ll1.lng)

    ### Get our x and y values between the two points
    x = sin(diffLong) * cos(lat2)
    y = cos(lat1) * sin(lat2) - (sin(lat1) * cos(lat2) * cos(diffLong))

    ### Bearing calculation
    initial_bearing = atan2(x, y)
    initial_bearing = degrees(initial_bearing)
    ### Normalise to a 360 degree circle
    compass_bearing = (initial_bearing + 360) % 360
    reverse_bearing = (initial_bearing - 180) % 360
    return(compass_bearing, reverse_bearing)
    
  def calculate_haversine_dist(self, lng1, lat1, lng2, lat2):
    """
    'Single-point' Haversine: Calculates the great circle distance
    between a to points
    """
    
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    lon1, lat1, lon2, lat2 = map(radians, [lng1, lat1, lng2, lat2])
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    # Return
    # should be (53, -0.003810847009248608, 0.007785977672197353, -1.8160105675190676, 0.5640252050785214, -1.8198214145283163, 0.5718111827507187)
    return(c*r)
  
  def add_sort_ids(self, df):
    '''
    Add pipe section and the sequence of each feature in the pipe
    Sorted by upstream weld - so pipe section terminated by weld, and starts with a feature
    '''
    ### Set sequences
    seq = df.groupby('us_weld_id').ngroup().to_frame('pipe_section')\
            .join(df.groupby('us_weld_id').cumcount().to_frame('section_sequence'))
    ### return joined dataframe
    return(df.join(seq))
    
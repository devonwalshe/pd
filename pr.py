import datetime, sys, logging
from functools import reduce
import pandas as pd
import numpy as np
from math import radians, cos, sin, asin, sqrt, atan2, degrees
from _logging import timed, logger

columns = ['id', 'wc', 'feature', 'us_weld_dist', 'wt', 'depth', 'length', 'width', 'orientation', 'pressure_1', 'pressure_2', 'joint_length', 'lat', 'lng', 'comments']

### Describes a PIG's run through a pipeline on a certain date
class PigRun(object):
  def __init__(self, init_columns = columns):
    self.init_columns = init_columns
    self.init_df = None
    self.file_path = None
    pass
    
  def init_run(self, path, label='A'):
    '''
    sets up the initial dataframe
    '''
    ### Import
    raw_df = pd.read_excel(path, names=self.init_columns, sheet_name="Original")
    raw_df.index.name = label
    self.raw_df = raw_df
    ### Process
    init_df = reduce(lambda result, function: function(result), (self.join_welds, self.calculate_weld_distance, 
                                                                 self.add_sort_ids, self.add_haversine, self.add_orientation_coords), 
                                              self.raw_df)
    ### sets the attribute for the initial data frame
    self.init_df = init_df
    return(self)
    
  def import_run(self):

    return(df)
  
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
        # ds_weld = np.NaN
      elif i == rows - 1:
        us_weld = np.NaN
        # ds_weld = df.iloc[widx[widx <= i].max()].id
      else:
        us_weld = df.iloc[widx[widx >= i].min()].id
        # ds_weld = df.iloc[widx[widx <= i].max()].id
      ids.append(us_weld)
    return(ids)
  
  @timed(logger)
  def join_welds(self, df):
    '''
    join weld position and subtract from feature position to get distance from upstream weld
    '''
    welds = pd.DataFrame(self.get_welds(df), columns=['us_weld_id'])
    welds = welds.astype('object')
    return(df.join(welds, how='left'))

  @timed(logger)
  def calculate_weld_distance(self, df):
    '''
    join weld position and subtract from feature position to get distance from upstream weld
    '''
    us_weld_join = df.merge(df[(df.feature == "WELD")][['id','wc','lat', 'lng']], left_on='us_weld_id', right_on='id', how='left')
    df['us_weld_dist_coord'] = [self.calculate_haversine_dist(lng1, lat1 , lng2, lat2, 'm') for 
                                lng1, lat1, lng2, lat2 in 
                                zip(us_weld_join.lng_x, us_weld_join.lat_x, us_weld_join.lng_y, us_weld_join.lat_y)]
    # ds_weld_join = df.merge(df[(df.feature == "WELD")][['id','wc']], left_on='ds_weld_id', right_on='id', how='left')
    df['us_weld_dist_wc'] = us_weld_join['wc_y'] - us_weld_join['wc_x']
    # df['ds_weld_dist'] = us_weld_join['wc_x'] - ds_weld_join['wc_y']
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
    
  def calculate_haversine_dist(self, lng1, lat1, lng2, lat2, unit='km'):
    """
    Haversine: Calculates the great circle distance
    between a to points
    
    a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
    """
    # Radius of earth in kilometers. Use 3956 for miles
    if unit == "m":
      r = 6371000
    elif unit == "km":
      r = 6371
    ### Set points to radians  
    lon1, lat1, lon2, lat2 = map(radians, [lng1, lat1, lng2, lat2])
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    # Return
    return(c*r)
  
  def add_orientation_coords(self, df):
    '''
    add orientation coordinate
    '''
    df[['orientation_x', 'orientation_y']] = pd.DataFrame([self.calculate_distance(theta) for theta in df.orientation])
    return(df)
  
  def calculate_distance(self, theta):
    '''
    calculate distance between two orientations
    
    parametric equation for a circle:
      x = r * cos(a)
      y = r * sin(a)
    where cx,cy = origin and a is in radians
    '''
    ### return if not a degree we can work with
    if theta == np.nan:
      return(np.NaN)
    ### Set radius of pipe to arbitrary distance
    r = 15
    ### Angles to radians
    a  = radians(theta)
    ### Degrees to x/y
    x,y = (r * cos(a), r * sin(a))
    
    return(x,y)
  
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
    
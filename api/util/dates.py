import datetime

class DateUtil(object):
  
  def __init__(self):
    pass
  
  def serialize_instance_dates(instance):
    datetime_keys = [k for k, v in instance.items() if type(v) == datetime.datetime]
    for datetime_key in datetime_keys:
      instance = {**instance, **{datetime_key:instance[datetime_key].isoformat()}}
    return(instance)
      
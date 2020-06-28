from matcher.pr import PigRun
from matcher.pr_matcher import PigRunMatcher
import datetime


def __main__():
  ### Import -> map columns -> validate columns -> match mode -> settings / match sensitivity -> match -> assemble
  
  ### 
  ### initialise the datasets
  pr1 = PigRun(mapping='wc').init_run('data/2014_t.xlsx', 'wc', "A")
  pr2 = PigRun(mapping='wc').init_run('data/2019_t.xlsx', 'wc', "B")
  ### Match them
  ### coordinate match
  matcher = PigRunMatcher(pr1, pr2, 'basic_coord')
  matched_runs_coord = matcher.match_runs()
  ### wc match
  matcher = PigRunMatcher(pr1, pr2, 'wc')
  matched_runs_wc = matcher.match_runs()
  ### Output
  matched_runs_coord.to_csv('data/output/matched_runs_coord_{}.csv'.format(datetime.datetime.now().strftime("%Y%m%d_%H%M%S")))
  matched_runs_wc.to_csv('data/output/matched_runs_wc_{}.csv'.format(datetime.datetime.now().strftime("%Y%m%d_%H%M%S")))
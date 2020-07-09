from matcher.pr import PigRun
from matcher.pr_matcher import PigRunMatcher
import datetime


def __main__():
  ### Import -> map columns -> validate columns -> match mode -> settings / match sensitivity -> match -> assemble
  
  ### 
  ### initialise the datasets
  pr1 = PigRun().init_run('data/case_1_2014.xlsx', 'basic_coord', "A", sheet_name='Original')
  pr2 = PigRun().init_run('data/case_1_2019.xlsx', 'basic_coord', "B", sheet_name='Original')
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
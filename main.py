from pr import PigRun
from pr_matcher import PigRunMatcher
import datetime


def __main__():
  ### Import -> map columns -> validate columns -> match mode -> settings / match sensitivity -> match -> assemble
  
  ### 
  ### initialise the datasets
  pr1 = PigRun().init_run('data/case_1_2014.xlsx', 'basic_coord', "A")
  pr2 = PigRun().init_run('data/case_1_2019.xlsx', 'basic_coord', "B")
  ### Match them
  ### coordinate match
  matcher = PigRunMatcher(pr1, pr2, 'basic_coord')
  matched_runs_coord = matcher.match_runs()
  ### wc match
  matcher = PigRunMatcher(pr1, pr2, 'wc')
  matched_runs_wc = matcher.match_runs()
  ### Output
  matched_runs.to_csv('data/output/matched_runs_{}.csv'.format(datetime.datetime.now().strftime("%Y%m%d_%H%M%S")))

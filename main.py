from pr import PigRun
from pr_matcher import PigRunMatcher
import datetime


def __main__():
  ### initialise the datasets
  pr1 = PigRun().init_run('data/case_1_2014.xlsx', "A")
  pr2 = PigRun().init_run('data/case_1_2019.xlsx', "B")
  ### Match them
  matcher = PigRunMatcher(pr1, pr2)
  matched_runs = matcher.match_runs()
  ### Output
  matched_runs.to_csv('data/output/matched_runs_{}.csv'.format(datetime.datetime.now().strftime("%Y%m%d_%H%M%S")))

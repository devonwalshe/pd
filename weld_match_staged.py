def match_welds(df1, df2):
  '''
  Main controller for a pigrun without co-ordinates
  '''
  ### Set up initial matched welds
  w1, w2 = (df1[df1.feature=="WELD"].reset_index().reset_index(), df2[df2.feature=="WELD"].reset_index().reset_index())
  matched_welds = [w1.loc[[0]], w2.loc[[0]]]

  try:
    ### Anchor iteration on left match, step forwards
    start = time.time()
    ### Set iteration count
    n = w1.shape[0]
    ### match welds sequentially until they don't agree with eachother
    while matched_welds[0].iat[-1, 0] + 1 <  n:
      ### update matched welds and decide whether to continue
      step, matched_welds = step_match(w1, w2, matched_welds)
      print(matched_welds[0].shape[0], flush=True, end="\r")
      ### Backtrack loop
      if not step:
        ### Backtrack from nearest short weld
        step, matched_welds = backtrack(w1, w2, matched_welds)
        print("\n Backtracking complete - continuing")
    return(matched_welds)
  except:
    print("\n\n"+str(time.time() - start))
    print(sys.exc_info())

def step_match(w1, w2, matched_welds, reverse=False):
  ''' Take last index of matched welds, and step forwards
      On the basis that the pipe length or upstream weld is roughly equal (check coord match to verify this)
      If right side doesn't match, return None
  '''
  ### Set up our comparisons
  if reverse:
    a2, b2 = (w1.iloc[[matched_welds[0].iat[0, 0] - 1]], 
                    w2.iloc[[matched_welds[1].iat[0, 0] - 1]])
  else:
    a2, b2 = (w1.iloc[[matched_welds[0].iat[-1, 0]+ 1]], 
                    w2.iloc[[matched_welds[1].iat[-1, 0] + 1]])
  ### Compare joint lengths - NOTE - in test dataset largest absolute difference was .481 
  #### as a % of mean of the joint lengths, it was .22
  if abs(a2.joint_length.item() - b2.joint_length.item()) < .5:
    ### TODO.- update this so backtracking uses US weld distance instead of pipe length
    if reverse:
      ### Prepend new weld to start of matched welds
      matched_welds = [pd.concat([a2, matched_welds[0]]), pd.concat([b2, matched_welds[1]])]
    else:
      ### Append new weld to end of matched welds
      matched_welds = [pd.concat([matched_welds[0], a2]), pd.concat([matched_welds[1], b2])]
    return(True, matched_welds)
  else:
    print('\n Mismatched welds - backtracking')
    return(False, matched_welds)
    
    
def backtrack(w1, w2, matched_welds):
  '''
  Alternate matching methodology - find nearest short weld, move backwards, updating matched welds as we go.  
  '''
  ### First short weld on A
  short_weld_a = w1[(w1.index > matched_welds[0].iat[-1, 0]) & (w1.joint_length < 40)].iloc[[0]]
  ### Matching short weld on B
  short_weld_b = w2[(w2.index > matched_welds[1].iat[-1, 0]) & 
                    (w2.joint_length.between(short_weld_a.joint_length.item() - 5, 
                                             short_weld_a.joint_length.item() + 5))].iloc[[0]]
  backtrack_welds = [short_weld_a, short_weld_b]
  ### Fill it up backwards until step returns False
  step = True
  while step:
    step, backtrack_welds = step_match(w1, w2, backtrack_welds, reverse=True)
  ### When it breaks, append our welds to matched welds, and return
  
  matched_welds = [pd.concat([matched_welds[0], backtrack_welds[0]]), pd.concat([matched_welds[1], backtrack_welds[1]])]
  return(True, matched_welds)
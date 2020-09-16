import logging, time, functools


logging.basicConfig(format='%(asctime)s.%(msecs)03d | %(levelname)s | %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
### set up logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)
# handler = logging.StreamHandler()
# handler.setLevel(logging.DEBUG)
# logger.addHandler(handler)



def timed(logger, level=None, format='%s: %s ms'):
    if level is None:
        level = logging.DEBUG

    def decorator(fn):
        @functools.wraps(fn)
        def inner(*args, **kwargs):
            start = time.time()
            result = fn(*args, **kwargs)
            duration = time.time() - start
            logger.log(level, format, repr(fn), round(duration * 1000,3))
            return result
        return inner

    return decorator

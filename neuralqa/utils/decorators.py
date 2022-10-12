import functools


def retry_on_exception(exception):
    def actual_decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except exception:
                return func(*args, **kwargs)
        return wrapper

    return actual_decorator

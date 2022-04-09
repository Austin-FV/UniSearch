from .course import Course

# Use the cmp functions when building a comparator.
# Use the key functions when sorting.

def make_composite_comparator(comparators = []):
    def complete_comparator(a: Course, b: Course):
        result = 0
        for comparator in comparators:
            result = comparator(a, b)
            if result != 0: return result
        return result
    return complete_comparator

def name_cmp(a: Course, b: Course, next = []) -> bool:
    return 0 if a.name == b.name else 1 if a.name <= b.name else -1

def name_key(a: Course):
    return a.name

def credit_cmp(a, b):
    return 0 if a.credit == b.credit else 1 if a.credit <= b.credit else -1

def credit_key(a: Course):
    return a.credit

def code_cmp(a, b):
    codea = a.dept + "*" + a.code
    codeb = b.dept + "*" + b.code
    return 0 if codea == codeb else 1 if codea <= codeb else -1

def code_key(a: Course):
    return a.dept + "*" + a.code


## These two comparators are in time-out because they're painful and probably not too useful.
def semester(a, b):
    pass #has to parse offerings somehow

## This one's probably useful but even more painful to implement.
def upcoming(a, b):
    pass #has to parse offerings somehow
from . import course

# Constructed with a condition.
# Takes a course and returns if it fits the conditions.
class Filter:

    def __init__(self, inverse = False):
        self.inverse = inverse

    # Tests the argument, then runs the inversion
    def test(self, course):
        return self.check(course) ^ self.inverse

    # The pure test for the filter's core purpose
    # Should only be called from test() but done like this
    # To enable later optimization.
    def check(self, course):
        return False #This filter should never succeed unless inverted.

# The condition for this filter is that its provided filters succeed.
# The reason the filter is built in the constructor is to prevent loops.
class MetaFilter(Filter):
    def __init__(self, filters, inverse = False):
        super().__init__(inverse)
        self.filters = filters

# All provided filters must pass.
class ConjunctiveFilter(MetaFilter):
    def check(self, course):
        for f in self.filters: # all for one
            if(not f.test(course)): return False
        return True

# One provided filter must pass.
class DisjunctiveFilter(MetaFilter):
    def check(self, course):
        for f in self.filters: # one for all
            if(f.test(course)): return True
        return False

# Matches a given department.
class DepartmentFilter(Filter):
    def __init__(self, department, inverse=False):
        super().__init__(inverse)
        self.department = department

    def check(self, course):
        #print("testing " + course.dept + " against " + self.department)
        return (course.dept == self.department)



# Checks if it's available in one (or more) semesters of a given year.
class SemesterFilter(Filter):
    def __init__(self, semester, year = None, certainty = False, inverse=False):
        super().__init__(inverse)
        self.semester = semester
        self.year = year
        self.certainty = certainty

    def check(self, course):
        # Why you'd want to invert this one is beyond me.
        # But it remains an option.
        return course.offered_in(self.semester, self.year, self.certainty)

class YearFilter(SemesterFilter):
    def __init__(self, year, certainty, inverse=False):
        super().__init__([], year, certainty, inverse)

# Checks if the course is worth what's provided.
# Includes an argument to alter the calculation.
class CreditFilter(Filter):
    def __init__(self, credit, compare = (lambda a, b : a == b),inverse=False):
        super().__init__(inverse)
        self.credit = credit
        self.compare = compare
    
    def check(self, course):
        return self.compare(course.credit, self.credit)

# Filter courses by code number.
class CodeFilter(Filter):
    def __init__(self, code, inverse=False):
        super().__init__(inverse)
        self.code = code

    def check(self, course):
        return self.code == str(course.code)

# Filter course code by if it's required in the program
class CourseCodeFilter(Filter):
    def __init__(self, codes, inverse=False):
        super().__init__(inverse)
        self.codes = set(codes)

    def check(self, course):
        return course.coursecode() in self.codes

# Filters based on whether the course exists in one (or all) of the dbs.
class DBFilter(Filter):
    def __init__(self, dbs, all = False, inverse=False):
        super().__init__(inverse)
        self.dbs = dbs
        self.all = all

    def check(self, course):
        count = 0
        for db in self.dbs:
            if course in db.courses and not self.all:
                return True
            elif self.all:
                return False
        return self.all # If you get here and needed just one, false, if you get here and needed all, True.

# Filters based on whether the course is a prereq of one of the db courses.
# Skip lets you choose whether to ignore courses already in the db.
# An alteration to the formula: skip now consists of its own list of dbs.
# This way, when recursively processing dbs, dbs only needs to have the new prereqs
# While the old ones can be put into Skip and tested against using super().check()
class PrereqFilter(DBFilter):
    def __init__(self, dbs, skip=None, all=False, inverse=False):
        super().__init__((dbs + skip) if skip else [], False, inverse) #Kinda pushing the relationship here.
        self.pall = all
        self.pdbs = dbs
        self.skip = skip

    def check(self, course):
        # Still need to test the skip flag.
        if super().check(course):
            return False

        # Please review the github for the monstrosity that was this function naught but a single commit ago.
        found = False
        for db in self.pdbs:
            good = False
            for course_ in db.courses:
                if course.coursecode() in course_.get_all_prereqs():
                    found = True
                    good = True
            if self.pall:
                if not good: return False
        return found
from . import course

class CourseDB:
    
    deptcode_function = None

    def __init__(self) -> None:
        self.courses = []

    # Puts a single course into the DB.
    def add_course(self, course):
        self.courses.append(course)
        return self

    # Sorts the DB courses
    def sort_courses(self, key_function):
        self.courses.sort(key=key_function)
        return self

    # Inserts courses into the DB from another DB
    # Takes an optional filter to eliminate some courses.
    # Note that this will not clean up courses already in the target db which would be excluded by that filter.
    # Great for collecting different sets of courses into a single DB all at once.
    def load_db(self, source: 'CourseDB', custom_filter = lambda x: True):
        for course in list(filter(custom_filter, source.courses)):
            self.add_course(course)
        return self

    # Find specific course in database
    def find_course(self, code):
        # Linear search through courses
        # TODO: Change to binary search?
        for c in self.courses:
            if (c.coursecode()) == code:
                return c
        return None


    # Removes all courses that do not match the filter.
    def filter_courses(self, custom_filter = lambda x: True):
        self.courses = list(filter(custom_filter, self.courses))

    # 
    def output_courses(self, custom_filter = lambda x: True, output_function = lambda x: x, sort_kf = None):
        return [output_function(c) for c in filter(custom_filter, sorted(self.courses, key = sort_kf) if sort_kf else self.courses)]

    def format_database(self):
        s = "Database:\n"
        if len(self.courses) == 0:
            s += "No courses match your current selection"
        else:
            for course in self.courses:
                s +=  "\n" + course.format_course() + "\n"
        return s
    
    def __eq__(self, obj):
        return self.courses == obj.courses

# load the json string into memory
# not implemented for now
# def parse_db_from_json(dbtext):
#    pass

# returns a string of the database
# not implemented for now
# def print_db_to_json(db):
#    pass

def create_db():
    return CourseDB()

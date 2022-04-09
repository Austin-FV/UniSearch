import datetime
import math
from collections.abc import Iterable

class Offering:
    ### Object Variables
    # semesters     Array<Boolean>    {"Winter": False, "Summer": False, "Fall": False}
    # frequency     Integer           The frequency in years the course is offered
    # offset        Integer           Offset the frequency (helpful for odd and even years)

    def __init__(self, semester, frequency = 1, offset = 0):
        self.semesters = {"Winter": False, "Summer": False, "Fall": False}
        for sem in semester:
            get, set = self.Semester(sem)
            if(not set): print(sem)
            set(True)
        self.frequency = frequency
        self.offset = offset

    # Returns two functions with closures targeting the variable for the chosen semester
    def Semester(self, sem):
        s = decide_semester(sem)
        #print("Sem: " + sem + ", " + str(s))
        if(not s):
            #return functions that do nothing
            return (lambda: None), (lambda x: None)

        target = list(self.semesters)[s-1]

        #print("Target: " + str(target))

        def getSemester():
            return self.semesters[target]

        def setSemester(new):
            value = getSemester()
            self.semesters[target] = new
            return value

        return getSemester, setSemester

    # Must fulfill all chosen semesters in the given year.
    def check_semester(self, semester = [], year = None, uncertainty = False): #TODO MAKE SURE UNCERTAINTY SHOULD BE FALSE BE DEFAULT
        #print("year:", year, ", semester:", semester)
        if (year is not None) and (not self.check_year(year)): return False
        if not isinstance(semester, Iterable):
            semester = (semester)
        for sem in semester:
            get, set = self.Semester(sem)
            if(get()): return True
        return False

    def check_year(self, year, uncertainty = False): #TODO MAKE SURE UNCERTAINTY SHOULD BE FALSE BE DEFAULT
        if not self.frequency: return not uncertainty
        if self.frequency < 0: return False
        return year % self.frequency == self.offset % self.frequency

    def next_year(self, current_year):
        return (math.ceil((current_year-self.offset) / self.frequency) * self.frequency) + self.offset

    def format_offering(self):
        s = ""
        semesters = [semester for semester in list(self.semesters) if self.semesters[semester]]
        if not semesters: return None
        for i in range(len(semesters)):
            if(i == 0):
                s += semesters[i].lower()
            elif(i == len(semesters) - 1):
                s += "," if i > 2 else "" + " and " + semesters[i].lower()
            else:
                s += ", " + semesters[i].lower()
        if self.frequency == 1:
            s += " every year."
        elif self.frequency == 2:
            s += " on " + "odd" if self.offset else "even" + " years."
        elif self.frequency < 0:
            s += " with uncertain frequency."
        elif self.frequency == 0:
            s += "."
        else:
            s += " every " + self.frequency + " years, including " + self.next_year(datetime.datetime.year()) + "."
        return s

    
def decide_semester(semester_string):
    if semester_string in ['W', 'w', "Winter", "winter", 1]:
        return 1
    elif semester_string in ['S', 's', "Summer", "summer", "Spring", "spring", 2]:
        return 2
    elif semester_string in ['F', 'f', 'Fall', 'fall', 3]:
        return 3
    else:
        return 0


class Course:
    ### Object Variables
    # name              String
    # desc              String
    # dept              String
    # code              String
    # credit            Float
    # exclusion = []    List<Offering>      Offerings in this list exclude the course from that time.
    # offering = []     List<Offering>      Offerings in this list include the course at that time.
    # location          String
    # prerequisite     List<Prereq>
    
    def __init__(self, name, desc, dept, code, credit, location, deptcode_function) -> None:
        self.name = name
        self.desc = desc
        self.dept = dept
        self.code = code
        self.year = int(code[0])
        self.credit = credit
        self.location = location
        self.exclusion = []
        self.offering = []
        self.prerequisite = None

        self.deptcode_function = deptcode_function

    def add_raw_prereq(self, prereq) -> None:
        # creating prereq object with the given string
        if self.prerequisite == None:
            if isinstance(prereq, Prereq): # add a prereq object
                self.prerequisite = prereq
            else: # create a prereq object
                self.prerequisite = Prereq(0,1,prereq)
        elif self.prerequisite.type == 0:
            self.prerequisite.add_course(prereq)
            self.prerequisite.requirements += 1
        elif self.prerequisite.type != 0:
            # if the type of first prereq isnt course, create new base prereq object that
            # contains new and old prereqs.
            new_prereq = Prereq(0,1,prereq)
            new_prereq.add_course(self.prerequisite)
            new_prereq.requirements += 1
            self.prerequisite = new_prereq
        else:
            print('add_raw_prereq: I shouldn\'t have reached this line')

    def add_prereq(self, dept, code) -> None:
        self.add_raw_prereq(self.coursecode())
        
    def get_all_prereqs(self):
        if self.prerequisite is None: return []
        return self.prerequisite.get_all_prereqs()

    def add_offering(self, semester, frequency = 1, offset = 0):
        offer = Offering(semester, abs(frequency), offset)
        (self.offering if frequency >= 0 else self.exclusion).append(offer)
        return self # This is for stringing functions together in one line

    #Checks if the course is available in a single semester in a given year.
    #If certainty is enabled then courses with an unspecified offering will be excluded.
    def offered_in(self, semester = [], year = None, certainty = False):
        for offering in self.exclusion:
            if offering.check_semester(semester, year): return False
        if not (self.offering or certainty): return True
        for offering in self.offering:
            if offering.check_semester(semester, year): return True
        return False

    def format_course(self):
        s = "Course:\n"
        s += "Name: " + str(self.name) + "\n"
        s += "Description: " + str(self.desc) + "\n"
        s += "Course Code: " + self.coursecode() + "\n"
        s += "Credits: " + str(self.credit)
        if(self.prerequisite):
            s += "\nPrerequisite: " + str(self.prerequisite)
        if(self.offering):
            for offering in self.offering:
                o = offering.format_offering()
                if o: s += "\nOffered in " + o
            if(self.exclusion):
                for exclusion in self.exclusion:
                    o = exclusion.format_offering()
                    if o: s += "\nNot offered in " + o
        return s

    def coursecode(self):
        return self.deptcode_function(self.dept, self.code)

    def __eq__(self, obj):
        return self.dept == obj.dept and self.code == obj.code

class Prereq():
    ### Variables
    # type              bitflag: 0 = courses
    #                            1 = credit restriction
    #                            2 = department restriction
    #                            4 = year restriction
    # requirements      flag(0) = number of courses required in the list of course
    #                   flag(1) = number of credits required in the list of course
    # courses           flag(0|1) = list of type String and Prereq
    #                   flag(2) = "department"
    #                   flag(4) = year

    def __init__(self, type, reqs, courses, literal):
        self.type = type
        self.requirements = reqs
        self.courses = []
        self.literal = literal
        if isinstance(courses, dict) or isinstance(courses, list):
            for course in courses:
                self.add_course(course)
        else:
            self.add_course(courses)

    def add_course(self, course):
        # Check course type
        if isinstance(course, dict): # recursively add more prereq objects
            new_prereq = Prereq(course['type'],course['requirement'],course['courses'])
            self.courses.append(new_prereq)
        else: # add the all other type objects (Hopefully Str, Int, Prereq)
            self.courses.append(course)

    def get_all_prereqs(self):
        reqs = []
        # if courses exist in this prereq, and the type is courses
        if len(self.courses) > 0 and self.type <= 1:
            for c in self.courses:
                if isinstance(c, str): # add course string
                    reqs.append(c)
                elif isinstance(c, Prereq): # grab strings from within object
                    reqs += c.get_all_prereqs()
        return reqs

    def __str__(self):
        s = self.literal if self.literal else 'None'
        return s


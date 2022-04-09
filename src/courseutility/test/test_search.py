import unittest

from modules.course import Course
from modules.db import CourseDB
import modules.sort
import modules.search

#Using unittest, add functions to run a single test each.
class TestSearch(unittest.TestCase):

    def setUp(self):
        # Creating db and adding courses
        self.base_db = CourseDB()
        self.base_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph").add_offering("S",2,1))    #Odd   Summer
        self.base_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph").add_offering("w"))        #Every Winter
        self.base_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph").add_offering("F",2,0))    #Even  Fall
        self.base_db.add_course(Course("Angel of Death", "Integrate..", "CIS", "2750", 0.75, "Guelph").add_offering("wf"))      #Every Winter & Fall
        pass

    def tearDown(self):
        pass

    def test_filter_department(self):
        # Replicating and filtering db
        filtered_db = CourseDB()
        filtered_db.load_db(self.base_db)
        filtered_db.filter_courses(modules.search.DepartmentFilter("CIS"))
        # Expected Output
        expected_db = CourseDB()
        expected_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph").add_offering("S",2,1))
        expected_db.add_course(Course("Angel of Death", "Integrate..", "CIS", "2750", 0.75, "Guelph").add_offering("wf"))
        self.assertEqual(expected_db, filtered_db, "Filter did not work")
        
    def test_filter_department_inv(self):
        # Replicating and filtering db
        filtered_db = CourseDB()
        filtered_db.load_db(self.base_db)
        filtered_db.filter_courses(modules.search.DepartmentFilter("CIS",True))
        # Expected Output
        expected_db = CourseDB()
        expected_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph").add_offering("w"))
        expected_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph").add_offering("F",2,0))
        self.assertEqual(expected_db, filtered_db, "Filter did not work")

    def test_filter_semester(self):
        # Replicating and filtering db
        filtered_db = CourseDB()
        filtered_db.load_db(self.base_db)
        filtered_db.filter_courses(modules.search.SemesterFilter("w",2031,True))
        # Expected Output
        expected_db = CourseDB()
        expected_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph").add_offering("w"))        #Every Winter
        expected_db.add_course(Course("Angel of Death", "Integrate..", "CIS", "2750", 0.75, "Guelph").add_offering("wf"))      #Every Winter & Fall
        self.assertEqual(expected_db, filtered_db, "Filter did not work")

    def test_filter_credit(self):
        # Replicating and filtering db
        filtered_db = CourseDB()
        filtered_db.load_db(self.base_db)
        filtered_db.filter_courses(modules.search.CreditFilter(0.75))
        # Expected Output
        expected_db = CourseDB()
        expected_db.add_course(Course("Angel of Death", "Integrate..", "CIS", "2750", 0.75, "Guelph").add_offering("wf"))
        self.assertEqual(expected_db, filtered_db, "Filter did not work")

    def test_filter_neq_credit(self):
        # Replicating and filtering db
        filtered_db = CourseDB()
        filtered_db.load_db(self.base_db)
        filtered_db.filter_courses(modules.search.CreditFilter(0.75))
        # Expected Output
        expected_db = CourseDB()
        expected_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph").add_offering("S",2,1))    #Odd   Summer
        expected_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph").add_offering("w"))        #Every Winter
        expected_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph").add_offering("F",2,0))    #Even  Fall
        expected_db.add_course(Course("Angel of Death", "Integrate..", "CIS", "2750", 0.75, "Guelph").add_offering("wf"))      #Every Winter & Fall
        self.assertNotEqual(expected_db, filtered_db, "Filter did not work")

    def test_filter_conjunctive(self):
        # Creating filters
        filters=[]
        filters.append(modules.search.SemesterFilter("f",2022,True))    # Even Fall
        filters.append(modules.search.CreditFilter(0.5))                # 0.5 Credits
        # Replicating and filtering db
        filtered_db = CourseDB()
        filtered_db.load_db(self.base_db)
        filtered_db.filter_courses(modules.search.ConjunctiveFilter(filters)) #Both filters need to pass
        # Expected Output
        expected_db = CourseDB()
        expected_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph").add_offering("F",2,0))    #Even  Fall
        self.assertEqual(expected_db, filtered_db, "Filter did not work")

    def test_filter_disjunctive(self):
        # Creating filters
        filters=[]
        filters.append(modules.search.SemesterFilter("f",2022,True))    # Even Fall
        filters.append(modules.search.CreditFilter(0.5))                # 0.5 Credits
        # Replicating and filtering db
        filtered_db = CourseDB()
        filtered_db.load_db(self.base_db)
        filtered_db.filter_courses(modules.search.DisjunctiveFilter(filters)) # Only 1 filter needs to pass
        # Expected Output
        expected_db = CourseDB()
        expected_db.add_course(Course("Programming II", "printf more", "CIS", "2500", 0.5, "Guelph").add_offering("S",2,1))    #Odd   Summer
        expected_db.add_course(Course("Calculus", "Curves and Stuff", "MATH", "1200", 0.5, "Guelph").add_offering("w"))        #Every Winter
        expected_db.add_course(Course("Linear Algebra", "The Matrix", "MATH", "1160", 0.5, "Guelph").add_offering("F",2,0))    #Even  Fall
        expected_db.add_course(Course("Angel of Death", "Integrate..", "CIS", "2750", 0.75, "Guelph").add_offering("wf"))      #Every Winter & Fall
        self.assertEqual(expected_db, filtered_db, "Filter did not work")
        
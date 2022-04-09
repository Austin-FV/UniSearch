import unittest

from modules.course import Course,Offering

#Using unittest, add functions to run a single test each.
class TestCourse(unittest.TestCase):

    def setUp(self):
        self.course = Course("Data Science", "Beeps and boops", "CIS", "4020", 0.5, "Guelph")
        self.course.add_offering("WF") # Winter and Fall every year
        self.course.add_offering("s",2,1) # Summer on odd years

    def tearDown(self):
        pass

    def test_course_eq(self):
        d = Course("Data Science", "Beeps and boops", "CIS", "4020", 0.5, "Guelph")
        self.assertEqual(self.course, d, "Courses not Equal")

    # temporarily disabled while creating new prereq structure
    # def test_course_prereqs(self):
    #     # Creating course and adding prereqs
    #     test = Course("Data Science", "Beeps and boops", "CIS", "4020", 0.5, "Guelph")
    #     test.add_prereq("CIS","2750")
    #     test.add_prereq("MATH","1160")
    #     test.add_prereq("STAT","2040")
    #     # Testing
    #     self.assertEqual(test.prerequisite, ["CIS*2750", "MATH*1160", "STAT*2040"], "Prerequisites not Equal")
        
    #Checking if any year winter and fall is correct
    def test_course_offered_in(self):
        self.assertTrue(self.course.offered_in("WF", 2022))
        self.assertTrue(self.course.offered_in("F", 2023))
        self.assertTrue(self.course.offered_in("S", 2021))
        self.assertFalse(self.course.offered_in("s", 2020))
        self.assertTrue(self.course.offered_in("f", 2021))


from . import course, db

palette = ["slateblue", "antiquewhite4", "chartreuse4", "aquamarine4",
        "firebrick4", "azure3", "seagreen4", "burlywood3",
        "magenta4", "cadetblue4", "olivedrab3", "coral4", "crimson"]

guelph_legend = lambda colour_list: \
        "subgraph cluster1 {" + \
        "label = \"Legend\";" + \
        "fontsize  = 15;" + \
        "shape = rectangle;" + \
        "4000 [shape=box style=filled color="+colour_list[4]+"];" + \
        "3000 [shape=box style=filled color="+colour_list[3]+"];" + \
        "2000 [shape=box style=filled color="+colour_list[2]+"];" + \
        "1000 [shape=box style=filled color="+colour_list[1]+"];" + \
        "8000 [shape=box style=filled color="+colour_list[8]+"];" + \
        "7000 [shape=box style=filled color="+colour_list[7]+"];" + \
        "6000 [shape=box style=filled color="+colour_list[6]+"];" + \
        "5000 [shape=box style=filled color="+colour_list[5]+"];" + \
        "1000 -> 5000 [style=invis];" + \
        "2000 -> 6000 [style=invis];" + \
        "3000 -> 7000 [style=invis];" + \
        "4000 -> 8000 [style=invis];" + \
        "\"Searched courses\" -> \"Prerequisite courses\" [style=invis];" + \
        "\"Searched courses\" [shape=box style=filled color=lightgrey];" + \
        "\"Prerequisite courses\" [shape=box color=lightgrey];" + \
        "\"Unavailable\" [color=lightgrey];" + \
        "}"

waterloo_legend = lambda colour_list: \
        "subgraph cluster1 {" + \
        "label = \"Legend\";" + \
        "fontsize  = 15;" + \
        "shape = rectangle;" + \
        "\"200 Series\" [shape=box style=filled color="+colour_list[2]+"];" + \
        "\"100 Series\" [shape=box style=filled color="+colour_list[1]+"];" + \
         "\"00 Series\" [shape=box style=filled color="+colour_list[0]+"];" + \
        "\"500 Series\" [shape=box style=filled color="+colour_list[5]+"];" + \
        "\"400 Series\" [shape=box style=filled color="+colour_list[4]+"];" + \
        "\"300 Series\" [shape=box style=filled color="+colour_list[3]+"];" + \
        "\"00 Series\" -> \"300 Series\" [style=invis];" + \
        "\"100 Series\" -> \"400 Series\" [style=invis];" + \
        "\"200 Series\" -> \"500 Series\" [style=invis];" + \
        "\"Searched courses\" -> \"Prerequisite courses\" [style=invis];" + \
        "\"Searched courses\" [shape=box style=filled color=lightgrey];" + \
        "\"Prerequisite courses\" [shape=box color=lightgrey];" + \
        "\"Unavailable\" [color=lightgrey];" + \
        "}"

def create_graph(master_db, start_db, deptcode_to_course, course_to_color = lambda x: 0, injected = "", title = ""):
    colour_list = ["grey","goldenrod1","firebrick1","dodgerblue1","darkolivegreen1","deeppink","chocolate1","darkorchid1","cyan1","burlywood1"]

    out = ""

    # Adding title
    if title is not None:
        out += "label = \""+title+"\";"
        out += "labelloc  =  t;" # title on top
        out += "fontsize  = 25;"
        # out += "fontcolor = blue;" # title colour?
        
    # Create digraph
    if injected: out += injected(colour_list)
    
    # Graph spacing
    out += 'graph [pad="0.25", nodesep="0.2", ranksep="1.5"];'

    graph = Graph(colour_list, out)
    handled_prereqs = set()
    remaining_prereqs = set()

    for c in start_db.courses: # For all courses in start database
        coursecode = deptcode_to_course(c.dept, c.code)
        graph.add_node(coursecode, "style=filled shape=box", course_to_color(coursecode))
        handled_prereqs.add(coursecode)

        # CREATE PREREQ LINKS
        prereqs = c.get_all_prereqs()
        #print(prereqs)
        if len(prereqs) != 0:
            remaining_prereqs.update(get_prereq_graph(graph, master_db, start_db, coursecode, course_to_color))

    remaining_prereqs = remaining_prereqs.difference(handled_prereqs)

    while remaining_prereqs:
        c = remaining_prereqs.pop()
        graph.add_node(c, "shape=box" if master_db.find_course(c) else "", course_to_color(c))
        handled_prereqs.add(c)

        further_prereqs = get_prereq_graph(graph, master_db, start_db, coursecode, course_to_color)
        remaining_prereqs.update(further_prereqs.difference(handled_prereqs))

    return graph.result()

def get_prereq_graph(graph, master_db, start_db, coursename, course_to_color = lambda x: 0):
    
    course = master_db.find_course(coursename)
    # Get prereqs
    if course is None: return set()
    prereqs = set(course.get_all_prereqs())
    if len(prereqs) == 0: return set()

    # CREATING PREREQ LINK
    global palette
    graph.add_edge(prereqs, coursename, None, palette[0])
    palette = palette[1:] + [palette[0]]
    
    # getting prereq strings
    return prereqs

class Graph:
    # First color should be default.
    def __init__(self, colors = ["black"], premade = ""):
        self.colors = colors
        self.string = premade

    def feed(self, anything): #Use with caution
        self.string += anything

    def get_color(self, color):
        if not color: return ""
        c = None
        if isinstance(color, int):
            c = self.colors[color]
        elif isinstance(color, str):
            c = color
        else:
            c = self.colors[0]
        return "color=" + c
    
    def compile_style(self, style, color):
        if not (style or color):
            return ""
        return "[" + (style if style else "") + " " + self.get_color(color) + "]"

    def add_node(self, title, style = None, color = 0):
        self.string += "\"" + title + "\"" + self.compile_style(style, color) + ";\n"

    def add_edge(self, parents, child, style = None, color = 0):
        edge_rule =  "{" + ','.join(('"' + parent + '"') for parent in parents) + "}"
        edge_rule += "->" + '"' + child + '"' + self.compile_style(style, color) + ';\n'
        self.string += edge_rule

    def all(self):
        return self.string
    
    def result(self):
        return "strict digraph G{" + self.string + "}"
// Showcase-mode copy of backend/content/sample.py — generated from it; keep the two in sync.
import type { Exercise, Goal } from "./coach";

export const DEFAULT_GOAL_ID = "python-basics";

export const GOALS: Goal[] = [
  {
    "id": "python-basics",
    "title": "Python basics",
    "description": "Variables, lists, loops and functions \u2014 rebuilt in small, five-minute pieces.",
    "source": "sample",
    "exercise_ids": [
      "pb-1",
      "pb-2",
      "pb-3",
      "pb-4"
    ]
  },
  {
    "id": "working-with-data",
    "title": "Working with data",
    "description": "Dictionaries and totals: the everyday shapes data takes in Python.",
    "source": "sample",
    "exercise_ids": [
      "db-1",
      "db-2"
    ]
  },
  {
    "id": "small-automations",
    "title": "Small automations",
    "description": "Decisions and text clean-up \u2014 the building blocks of useful scripts.",
    "source": "sample",
    "exercise_ids": [
      "au-1",
      "au-2"
    ]
  }
];

export const EXERCISES: Exercise[] = [
  {
    "id": "pb-1",
    "goal_id": "python-basics",
    "order": 1,
    "title": "Say it out loud",
    "concept": "Variables & print",
    "source": "sample",
    "hint": "A variable is just a name for a value: goal = \"...\". Then pass the name to print().",
    "easier_note": "Now it's a single print statement \u2014 no variable needed.",
    "standard": {
      "prompt": "Create a variable called `goal` that holds a short sentence about what you want to learn. Then print it.",
      "starter_code": "# Store a sentence in a variable, then print it\ngoal = \n",
      "required_snippets": [
        "goal =",
        "print(goal)"
      ],
      "estimated_minutes": 4
    },
    "easier": {
      "prompt": "Print one sentence about why you're back. That's the whole exercise.",
      "starter_code": "# Write one line that prints a sentence\n",
      "required_snippets": [
        "print("
      ],
      "estimated_minutes": 2
    }
  },
  {
    "id": "pb-2",
    "goal_id": "python-basics",
    "order": 2,
    "title": "Small list, real count",
    "concept": "Lists & len()",
    "source": "sample",
    "hint": "Lists use square brackets: topics = [\"a\", \"b\", \"c\"]. len(topics) returns how many items it has.",
    "easier_note": "The list is already written for you \u2014 just count it.",
    "standard": {
      "prompt": "Create a list called `topics` with three things you'd like to practise. Print how many items it contains using `len()`.",
      "starter_code": "# Make a list of three topics, then print its length\n",
      "required_snippets": [
        "topics = [",
        "len(topics)",
        "print("
      ],
      "estimated_minutes": 5
    },
    "easier": {
      "prompt": "The list exists already. Print its length with `len(topics)`.",
      "starter_code": "topics = [\"loops\", \"lists\"]\n# print the number of topics below\n",
      "required_snippets": [
        "len(topics)"
      ],
      "estimated_minutes": 2
    }
  },
  {
    "id": "pb-3",
    "goal_id": "python-basics",
    "order": 3,
    "title": "One loop at a time",
    "concept": "for loops",
    "source": "sample",
    "hint": "A for loop reads: for day in days: \u2014 then indent the line that should repeat.",
    "easier_note": "The loop is set up. You only add the line inside it.",
    "standard": {
      "prompt": "Given `days = [\"Mon\", \"Tue\", \"Wed\"]`, write a for loop that prints `Practising on <day>` for each day.",
      "starter_code": "days = [\"Mon\", \"Tue\", \"Wed\"]\n# loop over days and print a line for each\n",
      "required_snippets": [
        "for ",
        " in days",
        "print("
      ],
      "estimated_minutes": 5
    },
    "easier": {
      "prompt": "Fill in the body of the loop so it prints each day.",
      "starter_code": "days = [\"Mon\", \"Tue\"]\nfor day in days:\n    # print the day here\n    \n",
      "required_snippets": [
        "print(day)"
      ],
      "estimated_minutes": 2
    }
  },
  {
    "id": "pb-4",
    "goal_id": "python-basics",
    "order": 4,
    "title": "Write a tiny function",
    "concept": "Functions",
    "source": "sample",
    "hint": "Define with def greet(name):, send a value back with return, and call it as greet(\"Sam\").",
    "easier_note": "The function shell and the call are written. You only add the return line.",
    "standard": {
      "prompt": "Define a function `greet(name)` that returns `\"Welcome back, <name>\"`. Print the result of calling it with your name.",
      "starter_code": "# Define greet(name), then print a call to it\n",
      "required_snippets": [
        "def greet(name)",
        "return",
        "print(greet("
      ],
      "estimated_minutes": 6
    },
    "easier": {
      "prompt": "Add a `return` line so the function gives back a greeting that includes `name`.",
      "starter_code": "def greet(name):\n    # return a greeting that includes name\n    \n\nprint(greet(\"Sam\"))\n",
      "required_snippets": [
        "return"
      ],
      "estimated_minutes": 2
    }
  },
  {
    "id": "db-1",
    "goal_id": "working-with-data",
    "order": 1,
    "title": "Look something up",
    "concept": "Dictionaries",
    "source": "sample",
    "hint": "Dictionaries map keys to values. Read a value with square brackets: scores[\"tue\"].",
    "easier_note": "The dictionary is ready. Just read one value from it.",
    "standard": {
      "prompt": "Create a dictionary `scores` with `\"mon\": 2` and `\"tue\": 3`. Print the value stored under `\"tue\"`.",
      "starter_code": "# Build the scores dictionary, then print the value for \"tue\"\n",
      "required_snippets": [
        "scores = {",
        "scores[\"tue\"]"
      ],
      "estimated_minutes": 4
    },
    "easier": {
      "prompt": "Print the value stored under `\"mon\"`.",
      "starter_code": "scores = {\"mon\": 2, \"tue\": 3}\n# print the value for \"mon\"\n",
      "required_snippets": [
        "scores[\"mon\"]"
      ],
      "estimated_minutes": 2
    }
  },
  {
    "id": "db-2",
    "goal_id": "working-with-data",
    "order": 2,
    "title": "Add up your minutes",
    "concept": "Accumulating totals",
    "source": "sample",
    "hint": "Start with total = 0, then inside a loop use total += m. Or use the built-in sum().",
    "easier_note": "Python's built-in sum() does the adding for you.",
    "standard": {
      "prompt": "Given `minutes = [10, 15, 5]`, use a for loop to add them into a variable `total`, then print `total`.",
      "starter_code": "minutes = [10, 15, 5]\n# add the minutes up with a loop\n",
      "required_snippets": [
        "total = 0",
        "for ",
        "total +=",
        "print(total)"
      ],
      "estimated_minutes": 5
    },
    "easier": {
      "prompt": "Print the total of `minutes` using `sum(minutes)`.",
      "starter_code": "minutes = [10, 15, 5]\n# print the total using sum()\n",
      "required_snippets": [
        "sum(minutes)"
      ],
      "estimated_minutes": 2
    }
  },
  {
    "id": "au-1",
    "goal_id": "small-automations",
    "order": 1,
    "title": "Make a decision",
    "concept": "if / else",
    "source": "sample",
    "hint": "if minutes >= 10: runs the indented line when true; else: handles everything else.",
    "easier_note": "Only the if branch now \u2014 no else needed.",
    "standard": {
      "prompt": "Given `minutes = 12`, print `\"Solid session\"` if minutes is 10 or more, otherwise print `\"Every minute counts\"`.",
      "starter_code": "minutes = 12\n# use if / else to print one of two messages\n",
      "required_snippets": [
        "if ",
        "else",
        "print("
      ],
      "estimated_minutes": 4
    },
    "easier": {
      "prompt": "Print `\"Solid session\"` only if `minutes` is 10 or more.",
      "starter_code": "minutes = 12\n# print \"Solid session\" if minutes is 10 or more\n",
      "required_snippets": [
        "if minutes",
        "print("
      ],
      "estimated_minutes": 2
    }
  },
  {
    "id": "au-2",
    "goal_id": "small-automations",
    "order": 2,
    "title": "Tidy a messy string",
    "concept": "String methods",
    "source": "sample",
    "hint": "String methods chain: raw.strip() removes outer spaces, .lower() makes it lowercase.",
    "easier_note": "Just one method this time: .strip().",
    "standard": {
      "prompt": "Given `raw = \"  Python Practice  \"`, print it with the surrounding spaces removed and all letters lowercase.",
      "starter_code": "raw = \"  Python Practice  \"\n# print a cleaned-up version\n",
      "required_snippets": [
        ".strip()",
        ".lower()"
      ],
      "estimated_minutes": 3
    },
    "easier": {
      "prompt": "Print `raw` without the spaces around it, using `.strip()`.",
      "starter_code": "raw = \"  Python Practice  \"\n# print raw without surrounding spaces\n",
      "required_snippets": [
        ".strip()"
      ],
      "estimated_minutes": 2
    }
  }
];

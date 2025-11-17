// This must be a Client Component for all the interactivity
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLaptopCode, 
  FaReact, 
  FaJsSquare, 
  FaBrain, 
  FaChevronLeft, 
  FaChevronRight, 
  FaRedo, 
  FaArrowLeft 
} from 'react-icons/fa';

// --- (Mock Data - Now with 10+ questions per topic) ---
const practiceTopics = [
  { 
    name: 'JavaScript', 
    slug: 'javascript', 
    icon: <FaJsSquare />,
    description: "Test your core JavaScript fundamentals."
  },
  { 
    name: 'React', 
    slug: 'react', 
    icon: <FaReact />,
    description: "Practice React hooks, state, and patterns."
  },
  { 
    name: 'Behavioral', 
    slug: 'behavioral', 
    icon: <FaBrain />,
    description: "Prepare for common 'tell me about a time' questions."
  },
  { 
    name: 'Data Structures', 
    slug: 'datastructures', 
    icon: <FaLaptopCode />,
    description: "Review arrays, trees, hash maps, and more."
  },
];

// Your backend would return a list of questions based on the slug
const allQuestions = {
  javascript: [
    {
      id: 'js1',
      question: "What is the difference between '==' and '===' in JavaScript?",
      answer: "'==' performs type coercion, meaning it converts the operands to the same type before comparison. '===' (strict equality) does not perform type coercion and checks for both value and type equality. It is generally recommended to always use '==='."
    },
    {
      id: 'js2',
      question: "Explain what a 'closure' is in JavaScript.",
      answer: "A closure is a function that has access to its outer function's scope, even after the outer function has returned. This means it 'remembers' the variables from the scope where it was created."
    },
    {
      id: 'js3',
      question: "What are 'Promises' and why are they used?",
      answer: "A Promise is an object representing the eventual completion or failure of an asynchronous operation. They are used to handle async code in a more readable and manageable way than traditional callbacks, avoiding 'callback hell'."
    },
    {
      id: 'js4',
      question: "What is 'hoisting' in JavaScript?",
      answer: "Hoisting is JavaScript's default behavior of moving all `var` variable and function declarations to the top of their containing scope (either function or global) during the compilation phase, before the code is executed."
    },
    {
      id: 'js5',
      question: "What's the difference between `let`, `const`, and `var`?",
      answer: "`var` is function-scoped and is hoisted. `let` and `const` are block-scoped (scoped to the nearest curly braces) and are not hoisted to the top of their scope, which helps prevent common bugs."
    },
    {
      id: 'js6',
      question: "What is an 'Arrow Function' and how is it different from a regular function?",
      answer: "An arrow function `() => {}` provides a shorter syntax for writing functions. The main difference is that it does not have its own `this` binding. Instead, `this` is lexically bound, meaning it inherits `this` from the parent scope."
    },
    {
      id: 'js7',
      question: "What are the `map`, `filter`, and `reduce` array methods?",
      answer: "`map`: Creates a new array by applying a function to every element of the original array. `filter`: Creates a new array with all elements that pass a test (return true) from a provided function. `reduce`: Executes a reducer function on each element of the array, resulting in a single output value."
    },
    {
      id: 'js8',
      question: "What is 'event delegation'?",
      answer: "Event delegation is a technique of attaching a single event listener to a parent element, which will fire for all matching descendant elements. This is more efficient than attaching listeners to many individual child elements, especially for dynamic content."
    },
    {
      id: 'js9',
      question: "Explain the 'event loop'.",
      answer: "The event loop is a process that allows Node.js (and browsers) to perform non-blocking I/O operations. It constantly checks the 'call stack' and the 'message queue'. If the call stack is empty, it takes the first event from the queue and pushes its callback function onto the stack to be executed."
    },
    {
      id: 'js10',
      question: "What is the difference between `null` and `undefined`?",
      answer: "`undefined` typically means a variable has been declared but has not yet been assigned a value. `null` is an assignment value. It can be assigned to a variable as a representation of no value. `typeof undefined` is 'undefined', while `typeof null` is 'object' (a known bug in JS)."
    }
  ],
  react: [
    {
      id: 'r1',
      question: "What is the difference between state and props in React?",
      answer: "Props (properties) are read-only and are passed down from a parent component. State is internal to a component and can be changed by the component itself using the `useState` or `this.setState`. A component cannot change its own props, but it can change its own state."
    },
    {
      id: 'r2',
      question: "What does the `useEffect` hook do? Give an example.",
      answer: "The `useEffect` hook lets you perform side effects in function components. Side effects include data fetching, setting up subscriptions, and manually changing the DOM. It runs after every render, or only when its dependency array values change. Example: `useEffect(() => { document.title = 'New Title'; }, []);`"
    },
    {
      id: 'r3',
      question: "What is the 'Virtual DOM'?",
      answer: "The Virtual DOM (VDOM) is an in-memory representation of the real DOM. When a component's state changes, React creates a new VDOM, compares it with the previous VDOM ('diffing'), and then calculates the most efficient way to update the real DOM to match the new state."
    },
    {
      id: 'r4',
      question: "What is 'JSX'?",
      answer: "JSX stands for JavaScript XML. It is a syntax extension for JavaScript that allows you to write HTML-like code inside your JavaScript files. This code is then transpiled by tools like Babel into regular `React.createElement()` function calls."
    },
    {
      id: 'r5',
      question: "How do you pass data from a child component to a parent component?",
      answer: "You pass a callback function from the parent component down to the child component as a prop. The child component then calls this function with the data it needs to send up as an argument."
    },
    {
      id: 'r6',
      question: "What is 'prop drilling' and how can you avoid it?",
      answer: "Prop drilling is the process of passing props down through multiple layers of nested components that don't actually need the props, just to get them to a deeply nested child. You can avoid it using the React Context API or a state management library like Redux or Zustand."
    },
    {
      id: 'r7',
      question: "What is the difference between a controlled and an uncontrolled component?",
      answer: "In a controlled component, form data (like an `<input>`) is handled by React state. The component's `value` is set by state and its `onChange` handler updates that state. In an uncontrolled component, form data is handled by the DOM itself (e.g., using `useRef` to get the value when needed)."
    },
    {
      id: 'r8',
      question: "What is a 'React Hook'?",
      answer: "Hooks are functions (like `useState`, `useEffect`, `useContext`) that let you 'hook into' React state and lifecycle features from function components. They allow you to use state and other React features without writing a class."
    },
    {
      id: 'r9',
      question: "What is `useMemo` used for?",
      answer: "`useMemo` is a hook that returns a memoized *value*. It will only recompute the memoized value when one of the dependencies in its dependency array has changed. It's used for optimizing expensive calculations."
    },
    {
      id: 'r10',
      question: "What is `useCallback` used for?",
      answer: "`useCallback` is a hook that returns a memoized *callback function*. It's similar to `useMemo`, but for functions. It's useful when passing callbacks to child components that are optimized with `React.memo` to prevent unnecessary re-renders."
    },
    {
      id: 'r11',
      question: "What is 'React Context'?",
      answer: "The React Context API provides a way to pass data through the component tree without having to pass props down manually at every level. It's designed to share data that can be considered 'global' for a tree of React components, such as a theme or user authentication status."
    }
  ],
  behavioral: [
    {
      id: 'b1',
      question: "Tell me about a time you had a conflict with a teammate and how you resolved it.",
      answer: "Use the STAR method: (S)ituation: Describe the context and the people involved. (T)ask: Explain what your responsibility was. (A)ction: Detail the steps YOU took to resolve the conflict (e.g., 'I scheduled a 1-on-1 to understand their perspective...'). (R)esult: Explain the positive outcome and what you learned."
    },
    {
      id: 'b2',
      question: "Tell me about a time you had to learn a new technology quickly.",
      answer: "Use the STAR method: (S)ituation: 'We needed to implement a feature using a new library...' (T)ask: 'My task was to become the subject-matter expert...' (A)ction: 'I dedicated time to read the docs, built a small proof-of-concept, and...' (R)esult: 'The feature was delivered on time, and I was able to mentor others...'"
    },
    {
      id: 'b3',
      question: "Describe a challenging project you worked on. What was your role?",
      answer: "Use the STAR method: (S)ituation: Describe the project and *why* it was challenging (e.g., tight deadline, vague requirements, technical complexity). (T)ask: Explain your specific role and responsibilities. (A)ction: Describe the key actions *you* took to overcome the challenge. (R)esult: Explain the successful outcome and the impact of your contribution."
    },
    {
      id: 'b4',
      question: "Tell me about a time you made a mistake or failed at something.",
      answer: "Choose a real, but not catastrophic, mistake. Focus on accountability. (S)ituation: 'I pushed a change that I thought was safe...' (T)ask: '...but it caused a bug in production.' (A)ction: 'I immediately owned the mistake, worked with my team to roll it back, and then... I implemented a new unit test...' (R)esult: 'The bug was fixed quickly, and I learned the importance of...'."
    },
    {
      id: 'b5',
      question: "How do you handle working with tight deadlines?",
      answer: "Talk about prioritization, communication, and managing scope. Example: 'When facing a tight deadline, I first ensure I have a clear understanding of the 'must-have' requirements versus the 'nice-to-haves'. I break the work into smaller tasks, communicate my progress clearly with my manager, and am not afraid to ask for help or flag potential blockers early.'"
    },
    {
      id: 'b6',
      question: "Why do you want to work for this company?",
      answer: "This requires research. Your answer should have two parts: 1) What you admire about the company (its mission, product, tech stack, or culture). 2) How your skills and career goals align with that, making you a great fit."
    },
    {
      id: 'b7',
      question: "What are your strengths?",
      answer: "Pick 2-3 relevant strengths (e.g., 'fast learner,' 'strong collaborator,' 'good problem-solver'). For each one, have a very brief example or story ready to back it up if they ask."
    },
    {
      id: 'b8',
      question: "What is your biggest weakness?",
      answer: "Choose a real weakness (e.g., 'I can be impatient with slow processes,' or 'I sometimes struggle with public speaking'). Most importantly, explain what *specific steps* you are actively taking to improve it (e.g., 'I've started..."
    },
    {
      id: 'b9',
      question: "Tell me about a time you disagreed with a manager or a senior engineer.",
      answer: "This question tests your communication and collaboration skills. Focus on a respectful, professional disagreement. (S)ituation: 'My tech lead suggested an approach...' (T)ask: 'I had concerns about its scalability...' (A)ction: 'I gathered some data/benchmarks, presented my alternative approach, and we discussed the trade-offs...' (R)esult: 'We ended up going with a hybrid solution...'"
    },
    {
      id: 'b10',
      question: "Where do you see yourself in 5 years?",
      answer: "Be ambitious but realistic. Show that you want to grow *with* the company. Example: 'In 5 years, I hope to have grown into a senior or lead developer role. I'm passionate about mentorship and would love to be in a position where I can help guide junior developers, while also taking on more complex technical challenges.'"
    }
  ],
  datastructures: [
     {
      id: 'ds1',
      question: "What is a Hash Map (or Dictionary)?",
      answer: "A Hash Map is a data structure that stores key-value pairs. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found. This allows for very fast lookups (average time complexity of O(1))."
     },
     {
      id: 'ds2',
      question: "What is the difference between an Array and a Linked List?",
      answer: "An Array stores elements in contiguous memory locations, allowing for fast O(1) random access (read). A Linked List stores elements in nodes, where each node contains a value and a pointer to the next node. This allows for fast O(1) insertion or deletion at the beginning or end."
    },
    {
      id: 'ds3',
      question: "What is a 'Stack' and what are its main operations?",
      answer: "A Stack is a LIFO (Last-In, First-Out) data structure. The main operations are `push` (add an element to the top) and `pop` (remove an element from the top). It's used for things like function call management and syntax parsing."
    },
    {
      id: 'ds4',
      question: "What is a 'Queue' and what are its main operations?",
      answer: "A Queue is a FIFO (First-In, First-Out) data structure. The main operations are `enqueue` (add an element to the back) and `dequeue` (remove an element from the front). It's used for task scheduling, like a printer queue."
    },
    {
      id: 'ds5',
      question: "What is a 'Binary Search Tree' (BST)?",
      answer: "A Binary Search Tree is a node-based binary tree where for each node, all values in its left-subtree are less than the node's value, and all values in its right-subtree are greater. This property allows for efficient searching, insertion, and deletion (average time of O(log n))."
    },
    {
      id: 'ds6',
      question: "What is 'Big O Notation'?",
      answer: "Big O Notation is used to describe the time or space complexity of an algorithm. It describes the worst-case scenario and shows how the algorithm's runtime or space requirements grow as the input size (n) increases."
    },
    {
      id: 'ds7',
      question: "What is the time complexity of a binary search?",
      answer: "O(log n). Binary search works on a sorted array by repeatedly dividing the search interval in half. Because it cuts the search space in half with each operation, it is extremely fast for large datasets."
    },
    {
      id: 'ds8',
      question: "What is a 'Graph' data structure?",
      answer: "A Graph is a data structure consisting of a set of nodes (or vertices) and a set of edges (or connections) that link the nodes. Graphs are used to model networks, like social networks, road maps, or the internet."
    },
    {
      id: 'ds9',
      question: "Explain the difference between 'Breadth-First Search' (BFS) and 'Depth-First Search' (DFS).",
      answer: "BFS and DFS are two algorithms for traversing a graph. BFS explores all of a node's neighbors at the present 'level' before moving on to the next level (it uses a Queue). DFS explores as far as possible down one branch before backtracking (it uses a Stack or recursion)."
    },
    {
      id: 'ds10',
      question: "What is a 'Trie'?",
      answer: "A Trie (or prefix tree) is a tree-like data structure used for storing strings. Each node represents a single character. It's highly efficient for prefix-based searches, making it perfect for implementing features like autocomplete or spell-checkers."
    }
  ]
};
// --- (End of Mock Data) ---


// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// --- The Page Component ---
export default function PracticePage() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // === Step 1: Handle Topic Selection ===
  const handleTopicSelect = (topic) => {
    setIsLoading(true);
    setSelectedTopic(topic);
    
    // ---
    // ⬇️ *** YOUR REAL API CALL GOES HERE *** ⬇️
    // In a real app, you would fetch this:
    // const response = await fetch(`/api/questions?topic=${topic.slug}`);
    // const data = await response.json();
    // setQuestions(data);
    // ---

    // Simulating API call
    setTimeout(() => {
      setQuestions(allQuestions[topic.slug] || []);
      setCurrentQuestionIndex(0);
      setIsAnswerShown(false);
      setIsLoading(false);
    }, 750); // Simulate network delay
  };

  // === Step 2: Handle Navigation ===
  const handleGoBack = () => {
    setSelectedTopic(null);
    setQuestions([]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswerShown(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsAnswerShown(false);
    }
  };

  // --- View 1: Topic Selection Grid ---
  const renderTopicSelection = () => (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">
        Choose a Topic to Practice
      </h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {practiceTopics.map((topic) => (
          <motion.div
            key={topic.slug}
            className="bg-white p-6 rounded-lg shadow-lg cursor-pointer
                       transition-all duration-300 hover:shadow-xl hover:border-blue-500 border-2 border-transparent"
            onClick={() => handleTopicSelect(topic)}
            variants={cardVariants}
          >
            <div className="flex items-center gap-4">
              <div className="text-blue-600 text-4xl p-3 bg-blue-50 rounded-lg">
                {topic.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {topic.name}
                </h3>
                <p className="text-gray-500">{topic.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );

  // --- View 2: Main Practice Session ---
  const renderPracticeSession = () => {
    if (isLoading) {
      return (
        <div className="text-center py-20">
          <p className="text-lg text-gray-600">Loading questions...</p>
        </div>
      );
    }

    // Check if we are at the end of the session
    if (currentQuestionIndex >= questions.length) {
      return renderCompletionScreen();
    }
    
    const question = questions[currentQuestionIndex];

    return (
      <div className="max-w-3xl mx-auto">
        {/* --- Back Button --- */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-blue-600 font-semibold mb-6
                     hover:text-blue-800 transition-colors"
        >
          <FaArrowLeft />
          Back to Topics
        </button>

        {/* --- Question Card --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id} // This key ensures the animation re-runs on question change
            className="bg-white shadow-xl rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 md:p-8">
              <p className="text-sm font-semibold text-blue-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 my-4">
                {question.question}
              </h2>

              <button
                onClick={() => setIsAnswerShown(!isAnswerShown)}
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                {isAnswerShown ? 'Hide Answer' : 'Show Answer'}
              </button>

              {/* Animated Answer Section */}
              <AnimatePresence>
                {isAnswerShown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-700 leading-relaxed text-lg bg-gray-50 p-4 rounded-md border">
                      {question.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- Navigation Footer --- */}
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:bg-gray-200 transition-colors"
              >
                <FaChevronLeft />
                Previous
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold
                           bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Session' : 'Next'}
                <FaChevronRight />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  // --- View 3: Completion Screen ---
  const renderCompletionScreen = () => (
    <motion.div 
      className="text-center max-w-lg mx-auto bg-white p-10 rounded-lg shadow-xl"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Practice Session Complete!
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        You've completed all questions for {selectedTopic.name}. Great job!
      </p>
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold
                   bg-blue-600 text-white hover:bg-blue-700 transition-colors mx-auto"
      >
        <FaRedo />
        Practice Another Topic
      </button>
    </motion.div>
  );

  // --- Main Page Render ---
  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* === 1. Hero Section === */}
      <section className="text-center py-20 px-6 bg-white shadow-sm">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          Practice Mock Questions
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
          Confidence comes from preparation. Start practicing now.
        </p>
      </section>
      
      {/* === 2. Main Content (Topics or Practice Session) === */}
      <section className="py-16 px-6">
        {selectedTopic ? renderPracticeSession() : renderTopicSelection()}
      </section>

    </div>
  );
}
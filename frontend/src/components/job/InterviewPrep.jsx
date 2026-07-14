import { useState } from 'react'
import { HiOutlineLightBulb, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi'

const QUESTIONS_DB = {
  'React': [
    {
      q: 'What is Virtual DOM and how does it work?',
      a: 'Virtual DOM is a JavaScript object that is a copy of the real DOM. When state changes, React first updates the Virtual DOM, then uses a diff algorithm to update only the changed parts in the real DOM — this makes performance much better.',
    },
    {
      q: 'What is the difference between useState and useEffect?',
      a: 'useState manages component state (stores data). useEffect handles side effects like API calls, subscriptions, or DOM manipulation — it runs after render.',
    },
    {
      q: 'What is the difference between Props and State?',
      a: 'Props are passed from parent to child and are read-only. State is the component\'s own data that it manages itself, and when it changes, it triggers a re-render.',
    },
    {
      q: 'Why are keys important in React lists?',
      a: 'Keys help React identify list items. When a list updates, React uses keys to know which element was added/removed/changed — this allows efficient re-rendering.',
    },
    {
      q: 'When do we use useMemo and useCallback?',
      a: 'useMemo caches expensive calculations. useCallback caches function references so child components don\'t unnecessarily re-render. Both are used for performance optimization.',
    },
  ],
  'Node.js': [
    {
      q: 'Why is Node.js fast even though it is single-threaded?',
      a: 'Node.js uses an event loop and non-blocking I/O. When an I/O operation happens, Node.js doesn\'t wait — it registers a callback and moves to the next task. This allows high concurrency on a single thread.',
    },
    {
      q: 'What is middleware in Express?',
      a: 'Middleware are functions that have access to the request-response cycle. They can process requests, send responses, or call the next middleware. Authentication, logging, error handling — all are done through middleware.',
    },
    {
      q: 'What is the difference between Callbacks and Promises?',
      a: 'Callbacks are functions called when an async operation completes — but nested callbacks create "callback hell". Promises give a cleaner syntax and allow chaining. async/await is an even cleaner syntax for Promises.',
    },
  ],
  'JavaScript': [
    {
      q: 'What is a Closure in JavaScript?',
      a: 'A closure is a function that remembers variables from its outer scope, even after the outer function has executed. It is used for data privacy and creating function factories.',
    },
    {
      q: 'What is event bubbling and capturing?',
      a: 'In event bubbling, an event bubbles up from child to parent. In capturing, it goes from parent to child. You can stop bubbling with event.stopPropagation().',
    },
    {
      q: 'What is the difference between == and ===?',
      a: '== checks loose equality and does type coercion (e.g. "5" == 5 is true). === checks strict equality — both type and value must be the same (e.g. "5" === 5 is false).',
    },
    {
      q: 'What is the difference between let, const, and var?',
      a: 'var is function-scoped and can be re-declared. let is block-scoped and can be updated but not re-declared. const is block-scoped and cannot be updated or re-declared.',
    },
  ],
  'MongoDB': [
    {
      q: 'What is the difference between SQL and NoSQL?',
      a: 'SQL is a relational database — fixed schema, tables, joins. NoSQL has a flexible schema — documents, collections. MongoDB is NoSQL and stores JSON-like documents. SQL is better for complex relationships, MongoDB is better for flexible/scalable data.',
    },
    {
      q: 'Why is indexing important in MongoDB?',
      a: 'Indexes improve query performance. Without an index, MongoDB scans the entire collection. With an index, only relevant documents are checked — much faster.',
    },
  ],
  'Python': [
    {
      q: 'What is the difference between a List and a Tuple?',
      a: 'A List is mutable (can be changed) and uses []. A Tuple is immutable (cannot be changed) and uses (). Tuples are faster and can be used as dictionary keys.',
    },
    {
      q: 'What are decorators in Python?',
      a: 'Decorators are functions that wrap other functions — they modify their behavior without changing the code. The @decorator syntax is used. Common examples: @staticmethod, @classmethod, @property.',
    },
  ],
  'TypeScript': [
    {
      q: 'What is the difference between TypeScript and JavaScript?',
      a: 'TypeScript is a superset of JavaScript that adds static typing. It catches errors at compile time rather than runtime, making code more reliable and easier to maintain in large projects.',
    },
    {
      q: 'What are interfaces and types in TypeScript?',
      a: 'Both define the shape of an object. Interfaces are extensible and better for object shapes. Types are more flexible and can represent unions, intersections, and primitives.',
    },
  ],
  'SQL': [
    {
      q: 'What is the difference between INNER JOIN and LEFT JOIN?',
      a: 'INNER JOIN returns only rows where there is a match in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table — unmatched rows show NULL.',
    },
    {
      q: 'What is database normalization?',
      a: 'Normalization is the process of organizing a database to reduce redundancy and improve data integrity. It involves dividing large tables into smaller ones and defining relationships between them.',
    },
  ],
  'AWS': [
    {
      q: 'What are the main services in AWS?',
      a: 'Key AWS services include EC2 (virtual servers), S3 (object storage), RDS (managed databases), Lambda (serverless functions), CloudFront (CDN), and IAM (identity and access management).',
    },
    {
      q: 'What is the difference between EC2 and Lambda?',
      a: 'EC2 is a virtual server that runs continuously — you manage the OS and scaling. Lambda is serverless — it runs code in response to events and scales automatically. Lambda is better for event-driven tasks.',
    },
  ],
  'Docker': [
    {
      q: 'What is the difference between a Docker Image and a Container?',
      a: 'A Docker Image is a read-only template with instructions for creating a container. A Container is a running instance of an image. One image can create many containers.',
    },
    {
      q: 'What is Docker Compose?',
      a: 'Docker Compose is a tool for defining and running multi-container applications. You define services in a docker-compose.yml file and start all of them with a single command.',
    },
  ],
  'Git': [
    {
      q: 'What is the difference between git merge and git rebase?',
      a: 'git merge combines branches and creates a merge commit, preserving the history of both branches. git rebase moves or replays commits on top of another branch, creating a linear history.',
    },
    {
      q: 'How do you revert a commit in Git?',
      a: 'git revert creates a new commit that undoes changes from a specific commit — safe for shared branches. git reset moves the HEAD pointer back — use with caution on shared branches.',
    },
  ],
  'Machine Learning': [
    {
      q: 'What is the difference between supervised and unsupervised learning?',
      a: 'Supervised learning uses labeled data to train a model (e.g. classification, regression). Unsupervised learning finds patterns in unlabeled data (e.g. clustering, dimensionality reduction).',
    },
    {
      q: 'What is overfitting and how do you prevent it?',
      a: 'Overfitting is when a model learns the training data too well and performs poorly on new data. Prevention techniques include cross-validation, regularization, dropout, and using more training data.',
    },
  ],
  'default': [
    {
      q: 'Tell me about yourself.',
      a: 'Briefly introduce your name, education, skills, and projects. Focus on relevant experience and what makes you a good fit for this role.',
    },
    {
      q: 'What was your most challenging project?',
      a: 'Pick a specific project, describe the problem, what you did, and what the result was — follow the STAR method (Situation, Task, Action, Result).',
    },
    {
      q: 'Where do you see yourself in 5 years?',
      a: 'Give a realistic and ambitious answer. Mention technical growth and leadership aspirations aligned with the company\'s direction.',
    },
    {
      q: 'How do you work in a team?',
      a: 'Give examples of communication, collaboration, and conflict resolution. Mention specific tools like Git, Jira, or Slack that you have used for team work.',
    },
    {
      q: 'What is your biggest weakness?',
      a: 'Mention a real weakness but also explain how you are actively working on improving it. Show self-awareness and a growth mindset.',
    },
    {
      q: 'Why do you want to work at this company?',
      a: 'Research the company and mention specific things you admire — their product, culture, tech stack, or mission. Show genuine interest.',
    },
    {
      q: 'How do you handle tight deadlines?',
      a: 'Explain your approach to prioritization, time management, and communication. Give a specific example where you successfully delivered under pressure.',
    },
    {
      q: 'Do you have any questions for us?',
      a: 'Always ask questions! Good ones: What does the onboarding process look like? What does a typical day look like? What are the biggest challenges of this role?',
    },
  ],
}

function getQuestions(skills = []) {
  const all = []
  skills.forEach(skill => {
    if (QUESTIONS_DB[skill]) {
      QUESTIONS_DB[skill].forEach(q => all.push({ ...q, skill }))
    }
  })
  if (all.length < 5) {
    QUESTIONS_DB.default.forEach(q => all.push({ ...q, skill: 'General' }))
  }
  return all.slice(0, 10)
}

function QuestionCard({ item, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-surface-900 dark:text-white text-left">{item.q}</p>
            <span className="badge-primary text-xs mt-1 inline-block">{item.skill}</span>
          </div>
        </div>
        {open
          ? <HiOutlineChevronUp className="text-surface-400 shrink-0 ml-2" />
          : <HiOutlineChevronDown className="text-surface-400 shrink-0 ml-2" />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-surface-100 dark:border-surface-800">
          <div className="mt-3 p-3 rounded-xl bg-accent-400/10 dark:bg-accent-400/5">
            <p className="text-xs font-semibold text-accent-600 mb-1.5">💡 Sample Answer:</p>
            <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">{item.a}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function InterviewPrep({ jobSkills = [] }) {
  const questions = getQuestions(jobSkills)

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineLightBulb className="text-warn-500 text-xl" />
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">
          Interview Preparation
        </h3>
        <span className="badge-yellow">{questions.length} questions</span>
      </div>

      <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
        Interview questions based on this job's required skills — click to see sample answers:
      </p>

      <div className="space-y-2">
        {questions.map((item, i) => (
          <QuestionCard key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  )
}

export interface InterviewQuestion {
  id: number;
  title: string;
  prompt: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const makeQuestions = (
  items: [string, string, InterviewQuestion['difficulty']][],
): InterviewQuestion[] =>
  items.map(([title, prompt, difficulty], index) => ({
    id: index + 1,
    title,
    prompt,
    topic: title.split(' ')[0],
    difficulty,
  }));

const javascript = makeQuestions([
  [
    'Explain the event loop',
    'Walk through how the call stack, task queue, and microtask queue work together when JavaScript runs asynchronous code.',
    'Medium',
  ],
  [
    'Closures',
    'What is a closure? Give an example of when you would use one in an application.',
    'Medium',
  ],
  [
    'var, let, and const',
    'Compare their scope and reassignment behavior. What is the temporal dead zone?',
    'Easy',
  ],
  [
    'Promise.all',
    'How does Promise.all behave when one input promise rejects? When would you choose allSettled instead?',
    'Medium',
  ],
  [
    'Debouncing',
    'Describe how you would implement a debounce function and where it is useful.',
    'Medium',
  ],
  [
    'Prototype chain',
    'How does property lookup work through JavaScript’s prototype chain?',
    'Medium',
  ],
  [
    'Async error handling',
    'How do you handle errors from an awaited promise inside an async function?',
    'Easy',
  ],
  [
    'Equality operators',
    'Explain the difference between == and ===, including a case where coercion can surprise you.',
    'Easy',
  ],
  [
    'Memory leaks',
    'Name common causes of memory leaks in browser JavaScript and how you would investigate one.',
    'Hard',
  ],
  [
    'Immutable updates',
    'How would you update a deeply nested value without mutating the original object?',
    'Medium',
  ],
]);

const typescript = makeQuestions([
  [
    'Type aliases and interfaces',
    'How do type aliases and interfaces differ, and when would you choose each?',
    'Easy',
  ],
  [
    'Generic functions',
    'Write the shape of a generic function that returns the first item of an array while preserving its type.',
    'Medium',
  ],
  ['Union narrowing', 'What techniques can narrow a union type safely at runtime?', 'Medium'],
  [
    'unknown and any',
    'How does unknown differ from any, and why is unknown safer at API boundaries?',
    'Easy',
  ],
  [
    'Utility types',
    'Explain Partial, Pick, and Omit with examples of where they help model update inputs.',
    'Medium',
  ],
  [
    'keyof and indexed access',
    'How can keyof and indexed access types keep a helper function tied to an object’s keys and values?',
    'Hard',
  ],
  [
    'Structural typing',
    'What does structural typing mean in TypeScript? How can it differ from nominal typing?',
    'Medium',
  ],
  [
    'Strict null checks',
    'What problems does strictNullChecks catch, and how do you model optional data?',
    'Medium',
  ],
  [
    'Discriminated unions',
    'How would you model loading, success, and failure states as a discriminated union?',
    'Medium',
  ],
  [
    'TypeScript compilation',
    'What is the role of tsconfig, and how does TypeScript relate to the JavaScript runtime?',
    'Easy',
  ],
]);

const python = makeQuestions([
  [
    'Python execution model',
    'What does the GIL do in CPython, and how does it affect CPU-bound and I/O-bound work?',
    'Hard',
  ],
  [
    'Decorators',
    'What is a decorator? Describe how you would write one that measures a function’s runtime.',
    'Medium',
  ],
  [
    'Generators',
    'How do generators differ from lists, and when would lazy iteration be useful?',
    'Medium',
  ],
  [
    'Lists and tuples',
    'Compare lists and tuples. What does immutability mean for a tuple containing a mutable object?',
    'Easy',
  ],
  [
    'Dictionaries',
    'How do Python dictionaries provide fast key lookup, and what makes an object usable as a key?',
    'Medium',
  ],
  [
    'Context managers',
    'How does a context manager help manage resources? What are __enter__ and __exit__ for?',
    'Medium',
  ],
  [
    'Identity and equality',
    'Explain the difference between is and ==. Give an example where confusing them causes a bug.',
    'Easy',
  ],
  [
    'Mutable defaults',
    'Why are mutable default arguments risky? Show a safe alternative.',
    'Medium',
  ],
  [
    'Asyncio',
    'What problems does asyncio solve, and how is an async function different from a thread?',
    'Hard',
  ],
  [
    'Memory management',
    'How does Python manage object memory and reclaim cyclic references?',
    'Medium',
  ],
]);

const java = makeQuestions([
  [
    'Object-oriented principles',
    'Explain encapsulation, abstraction, inheritance, and polymorphism with a practical example.',
    'Easy',
  ],
  [
    'JDK, JRE, and JVM',
    'How do the JDK, JRE, and JVM relate when compiling and running a Java program?',
    'Easy',
  ],
  [
    'Exception handling',
    'When would you use a checked exception versus an unchecked exception?',
    'Medium',
  ],
  [
    'equals and hashCode',
    'What contract should equals and hashCode follow when objects are used in a HashMap?',
    'Medium',
  ],
  [
    'Collections framework',
    'Compare ArrayList and LinkedList for common access and update patterns.',
    'Easy',
  ],
  ['Streams', 'How do intermediate and terminal operations work in the Java Stream API?', 'Medium'],
  [
    'Thread safety',
    'What makes shared mutable state unsafe across threads, and how would you protect it?',
    'Hard',
  ],
  [
    'Interfaces and abstract classes',
    'When would you use an interface and when an abstract class?',
    'Medium',
  ],
  [
    'Garbage collection',
    'What makes an object eligible for garbage collection? Can application code force collection?',
    'Medium',
  ],
  [
    'Immutable objects',
    'How would you design an immutable Java class, including its handling of mutable fields?',
    'Medium',
  ],
]);

const cpp = makeQuestions([
  ['RAII', 'Explain RAII and how it helps manage resources when exceptions are thrown.', 'Medium'],
  [
    'Pointers and references',
    'Compare pointers and references, including nullability and reassignment.',
    'Easy',
  ],
  ['Smart pointers', 'When would you use unique_ptr, shared_ptr, or weak_ptr?', 'Medium'],
  [
    'Virtual destructors',
    'Why should a polymorphic base class usually have a virtual destructor?',
    'Medium',
  ],
  [
    'Move semantics',
    'What problem do move semantics solve, and when is a move constructor used?',
    'Hard',
  ],
  ['Rule of five', 'What are the five special member functions in the rule of five?', 'Hard'],
  [
    'Templates',
    'What are function and class templates, and when can template errors appear?',
    'Medium',
  ],
  [
    'STL containers',
    'Compare vector and list for iteration, random access, and insertion.',
    'Easy',
  ],
  [
    'const correctness',
    'What does const mean for a pointer, a referenced value, and a member function?',
    'Medium',
  ],
  ['Concurrency', 'How do mutexes help protect shared data, and what is a deadlock?', 'Hard'],
]);

const react = makeQuestions([
  [
    'Props and state',
    'How are props and state different, and what should trigger a state update?',
    'Easy',
  ],
  ['Reconciliation', 'What does React reconciliation do when a component renders again?', 'Medium'],
  [
    'Effect dependencies',
    'How do you choose dependencies for useEffect, and what causes stale closures?',
    'Hard',
  ],
  [
    'Controlled inputs',
    'What makes a form input controlled in React, and what are the trade-offs?',
    'Easy',
  ],
  ['List keys', 'Why does React need stable keys when rendering lists?', 'Easy'],
  [
    'Context',
    'When is Context useful, and when can it cause too many components to re-render?',
    'Medium',
  ],
  [
    'Memoization',
    'Compare useMemo, useCallback, and React.memo. When should they be used?',
    'Medium',
  ],
  [
    'State ownership',
    'What does lifting state up mean, and how do you choose where state belongs?',
    'Medium',
  ],
  [
    'Error boundaries',
    'What errors can error boundaries catch, and what errors are outside their scope?',
    'Medium',
  ],
  [
    'Suspense',
    'What role does Suspense play when a component depends on a lazy-loaded resource?',
    'Hard',
  ],
]);

const nodejs = makeQuestions([
  [
    'Node event loop',
    'Describe how Node.js handles callbacks and asynchronous work through its event loop.',
    'Medium',
  ],
  [
    'Middleware',
    'What is middleware in an HTTP server, and how does request order affect behavior?',
    'Easy',
  ],
  ['Streams', 'What are readable and writable streams, and how does backpressure help?', 'Medium'],
  [
    'nextTick and setImmediate',
    'How do process.nextTick and setImmediate differ in scheduling?',
    'Hard',
  ],
  [
    'REST API design',
    'How would you design consistent resource routes and status codes for a REST API?',
    'Medium',
  ],
  [
    'Cluster and workers',
    'How can Node.js use multiple CPU cores, and what work is suitable for worker threads?',
    'Hard',
  ],
  [
    'Error handling',
    'How should an Express-style service handle synchronous and asynchronous errors?',
    'Medium',
  ],
  [
    'Non-blocking I/O',
    'What does non-blocking I/O mean, and why can CPU-heavy work still slow a Node server?',
    'Medium',
  ],
  ['Modules', 'Compare CommonJS and ES modules in Node.js.', 'Easy'],
  [
    'API security',
    'Name practical safeguards for a public Node.js API that accepts user input.',
    'Medium',
  ],
]);

const mongodb = makeQuestions([
  [
    'Documents and collections',
    'How do documents and collections compare with rows and tables?',
    'Easy',
  ],
  [
    'Index fundamentals',
    'How does an index speed up a query, and what cost does each extra index add?',
    'Medium',
  ],
  [
    'Aggregation pipeline',
    'Describe how stages in an aggregation pipeline transform documents.',
    'Medium',
  ],
  [
    'Embedding and references',
    'When would you embed related data and when would you reference another document?',
    'Medium',
  ],
  [
    'Replica sets',
    'How does a replica set improve availability, and what does the primary node do?',
    'Medium',
  ],
  [
    'Transactions',
    'When is a multi-document transaction useful, and what trade-offs come with it?',
    'Hard',
  ],
  ['Compound indexes', 'How does field order in a compound index affect query support?', 'Hard'],
  ['TTL indexes', 'What is a TTL index and what kinds of data fit that expiration model?', 'Easy'],
  [
    'Atomic updates',
    'What guarantees does MongoDB provide for a single-document update?',
    'Medium',
  ],
  [
    'Pagination',
    'Compare skip-based pagination with range-based pagination for a large collection.',
    'Medium',
  ],
]);

const postgresql = makeQuestions([
  [
    'ACID',
    'Explain atomicity, consistency, isolation, and durability in a database transaction.',
    'Easy',
  ],
  ['Join types', 'Compare inner, left, and full outer joins and give a use for each.', 'Easy'],
  ['B-tree indexes', 'How does a B-tree index support lookups and range scans?', 'Medium'],
  ['Isolation levels', 'What anomalies do transaction isolation levels control?', 'Hard'],
  [
    'Common table expressions',
    'What is a CTE, and when might a recursive CTE be useful?',
    'Medium',
  ],
  ['Window functions', 'How does a window function differ from a grouped aggregate?', 'Medium'],
  [
    'JSONB',
    'When is JSONB useful in PostgreSQL, and when should data use relational columns?',
    'Medium',
  ],
  ['Query plans', 'How would EXPLAIN ANALYZE help you investigate a slow query?', 'Hard'],
  ['Deadlocks', 'How can a deadlock occur, and what practices reduce the chance of one?', 'Medium'],
  [
    'Index selection',
    'How do you decide whether an index is worth adding for a query workload?',
    'Medium',
  ],
]);

const questionSets: Record<string, InterviewQuestion[]> = {
  javascript,
  typescript,
  python,
  java,
  cpp,
  react,
  nodejs,
  mongodb,
  postgresql,
};

export function getQuestions(technologyId: string): InterviewQuestion[] {
  return questionSets[technologyId] ?? javascript;
}

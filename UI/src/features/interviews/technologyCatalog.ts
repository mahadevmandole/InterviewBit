import { Atom, Braces, Coffee, CodeXml, Cpu, Database, FileCode2, Server, TableProperties } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Technology {
  id: string
  name: string
  category: string
  icon: LucideIcon
  color: string
  background: string
  description: string
}

export const technologies: Technology[] = [
  { id: 'javascript', name: 'JavaScript', category: 'Language', icon: Braces, color: '#a77900', background: '#fff5cf', description: 'From the event loop to everyday language fundamentals.' },
  { id: 'typescript', name: 'TypeScript', category: 'Language', icon: FileCode2, color: '#3178c6', background: '#eaf3ff', description: 'Types, generics, narrowing, and safer application code.' },
  { id: 'python', name: 'Python', category: 'Language', icon: CodeXml, color: '#32708b', background: '#e9f6f8', description: 'Python fundamentals, runtime behavior, and practical patterns.' },
  { id: 'java', name: 'Java', category: 'Language', icon: Coffee, color: '#bb5738', background: '#fff0e9', description: 'Core Java, collections, concurrency, and the JVM.' },
  { id: 'cpp', name: 'C++', category: 'Language', icon: Cpu, color: '#6755bd', background: '#f0edff', description: 'Modern C++, memory, templates, and standard library.' },
  { id: 'react', name: 'React', category: 'Framework', icon: Atom, color: '#1688a8', background: '#e8f8fc', description: 'Components, hooks, rendering, and state management.' },
  { id: 'nodejs', name: 'Node.js', category: 'Runtime', icon: Server, color: '#4f853e', background: '#eff8e9', description: 'The event loop, APIs, streams, and backend patterns.' },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', icon: Database, color: '#3c8b5b', background: '#ebf7ef', description: 'Document modeling, indexes, aggregation, and scale.' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', icon: TableProperties, color: '#42658a', background: '#edf3fa', description: 'Relational design, SQL, transactions, and query tuning.' },
]

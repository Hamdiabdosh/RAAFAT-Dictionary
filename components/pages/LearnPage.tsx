'use client'

import Link from 'next/link'
import { BookOpen, Layers, Brain, List, GraduationCap } from 'lucide-react'

const MODES = [
  {
    href: '/learn/topics',
    icon: BookOpen,
    title: 'Browse by letter',
    description: 'Study words grouped by Harari alphabet — ideal for classroom lessons',
    color: 'from-blue-500/20 to-blue-500/5',
  },
  {
    href: '/learn/flashcards',
    icon: Layers,
    title: 'Flashcards',
    description: 'Flip cards to practice Harari ↔ English at your own pace',
    color: 'from-primary/20 to-primary/5',
  },
  {
    href: '/learn/quiz',
    icon: Brain,
    title: 'Quick quiz',
    description: 'Test yourself with multiple-choice questions',
    color: 'from-accent/20 to-accent/5',
  },
  {
    href: '/learn/list',
    icon: List,
    title: 'My study list',
    description: 'Words you saved — share a link with your class',
    color: 'from-green-500/20 to-green-500/5',
  },
]

export function LearnPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-3 py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <GraduationCap size={16} />
          Learn Harari
        </div>
        <h1 className="text-4xl font-bold">Teaching & learning tools</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Practice vocabulary, browse by alphabet topic, or build a word list to share with students.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODES.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className={`p-6 rounded-xl border border-border bg-gradient-to-br ${mode.color} hover:border-primary/40 transition-all`}
          >
            <mode.icon className="text-primary mb-3" size={28} />
            <h2 className="text-lg font-semibold mb-1">{mode.title}</h2>
            <p className="text-sm text-muted-foreground">{mode.description}</p>
          </Link>
        ))}
      </div>

      <div className="p-5 rounded-xl border border-border bg-card space-y-2">
        <h3 className="font-medium">For teachers</h3>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>Pick an alphabet letter under <strong>Browse by letter</strong> for a themed lesson</li>
          <li>Save words to <strong>My study list</strong>, then copy the share link for your class</li>
          <li>Use <strong>Flashcards</strong> or <strong>Quiz</strong> in class on a projector or tablet</li>
        </ul>
      </div>
    </div>
  )
}

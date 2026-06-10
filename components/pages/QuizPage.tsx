'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react'
import { fetchRandomEntries, searchEntries } from '@/lib/api'
import { getStudyList, shuffle } from '@/lib/study'
import type { DictionaryEntry } from '@/lib/types'

const QUIZ_SIZE = 10

type Direction = 'harari-en' | 'en-harari'

function pickDistractors(correct: DictionaryEntry, pool: DictionaryEntry[], count: number) {
  const others = pool.filter((e) => e.id !== correct.id && e.english.trim())
  return shuffle(others).slice(0, count)
}

export function QuizPage() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') ?? undefined
  const ids = searchParams.get('ids') ?? undefined

  const [pool, setPool] = useState<DictionaryEntry[]>([])
  const [questions, setQuestions] = useState<DictionaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState<Direction>('harari-en')
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const buildQuiz = useCallback(async () => {
    setLoading(true)
    setIndex(0)
    setScore(0)
    setSelected(null)
    setDone(false)

    try {
      let entries: DictionaryEntry[] = []
      if (ids) {
        entries = (await searchEntries({ ids })).entries
      } else if (category) {
        entries = (await searchEntries({ category })).entries
      } else {
        const list = getStudyList()
        if (list.length >= 4) {
          entries = (await searchEntries({ ids: list.map((e) => e.id).join(',') })).entries
        } else {
          entries = (await fetchRandomEntries(40, category)).entries
        }
      }

      const shuffled = shuffle(entries.filter((e) => e.harari && e.english))
      setPool(shuffled)
      setQuestions(shuffled.slice(0, Math.min(QUIZ_SIZE, shuffled.length)))
    } finally {
      setLoading(false)
    }
  }, [ids, category])

  useEffect(() => {
    buildQuiz()
  }, [buildQuiz])

  const current = questions[index]
  const isHarariQuestion = direction === 'harari-en'

  const options = current
    ? shuffle([
        current,
        ...pickDistractors(current, pool, 3),
      ]).map((e) => ({
        id: e.id,
        label: isHarariQuestion ? e.english : e.harari,
        ethiopic: !isHarariQuestion,
      }))
    : []

  const correctLabel = current
    ? (isHarariQuestion ? current.english : current.harari)
    : ''

  const handleAnswer = (label: string) => {
    if (selected) return
    setSelected(label)
    const correct = label === correctLabel
    if (correct) setScore((s) => s + 1)

    setTimeout(() => {
      if (index + 1 >= questions.length) {
        setDone(true)
      } else {
        setIndex((i) => i + 1)
        setSelected(null)
      }
    }, 800)
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to Learn
      </Link>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold">Quick quiz</h1>
        <div className="flex gap-2">
          <select
            value={direction}
            onChange={(e) => { setDirection(e.target.value as Direction); buildQuiz() }}
            className="text-sm px-3 py-1.5 rounded-lg border border-border bg-input"
          >
            <option value="harari-en">Harari → English</option>
            <option value="en-harari">English → Harari</option>
          </select>
          <button onClick={buildQuiz} className="p-2 rounded-lg border border-border hover:bg-muted" title="New quiz">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : questions.length < 4 ? (
        <div className="text-center py-16 text-muted-foreground">
          Need at least 4 words for a quiz. Try a larger topic or study list.
        </div>
      ) : done ? (
        <div className="text-center py-12 space-y-4 rounded-2xl border border-border bg-card">
          <p className="text-5xl font-bold text-primary">{score}/{questions.length}</p>
          <p className="text-lg font-medium">
            {score === questions.length ? 'Perfect!' : score >= questions.length * 0.7 ? 'Great job!' : 'Keep practicing!'}
          </p>
          <button onClick={buildQuiz} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium">
            Try again
          </button>
        </div>
      ) : current ? (
        <>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {index + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>

          <div className="p-8 rounded-2xl border border-border bg-card text-center">
            <p className="text-xs uppercase text-muted-foreground mb-2">What does this mean?</p>
            <p className={`text-3xl font-bold ${isHarariQuestion ? 'font-ethiopic' : ''}`}>
              {isHarariQuestion ? current.harari : current.english}
            </p>
          </div>

          <div className="grid gap-2">
            {options.map((opt) => {
              const isCorrect = opt.label === correctLabel
              const isSelected = selected === opt.label
              let style = 'border-border hover:border-primary/50 hover:bg-muted/50'
              if (selected) {
                if (isCorrect) style = 'border-green-500 bg-green-500/10'
                else if (isSelected) style = 'border-red-500 bg-red-500/10'
                else style = 'border-border opacity-50'
              }

              return (
                <button
                  key={opt.id + opt.label}
                  onClick={() => handleAnswer(opt.label)}
                  disabled={!!selected}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${style}`}
                >
                  <span className={opt.ethiopic ? 'font-ethiopic text-lg' : ''}>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}

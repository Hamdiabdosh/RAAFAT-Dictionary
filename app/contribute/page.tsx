'use client'

import { Shell } from '@/components/layout/Shell'
import { Plus, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function ContributePage() {
  const [currentTab, setCurrentTab] = useState<'add' | 'correct'>('add')
  const [formData, setFormData] = useState({
    headword: '',
    partOfSpeech: 'noun',
    enTranslation: '',
    amTranslation: '',
    arTranslation: '',
    example: '',
    exampleTranslation: '',
    etymology: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert('Thank you for your contribution! It will be reviewed by moderators.')
    setFormData({
      headword: '',
      partOfSpeech: 'noun',
      enTranslation: '',
      amTranslation: '',
      arTranslation: '',
      example: '',
      exampleTranslation: '',
      etymology: '',
    })
  }

  return (
    <Shell showSearch={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Contribute to RAAFAT</h1>
          <p className="text-lg text-muted-foreground">
            Help us grow the dictionary by adding new words or suggesting improvements
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex gap-3">
          <AlertCircle className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-200">Community Driven</p>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              All contributions are reviewed by native speakers and moderators before being added to the dictionary.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setCurrentTab('add')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              currentTab === 'add'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="inline mr-2" size={18} />
            Add New Word
          </button>
          <button
            onClick={() => setCurrentTab('correct')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              currentTab === 'correct'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Suggest Correction
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {currentTab === 'add' ? (
            <>
              {/* Headword */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Harari Word</label>
                <input
                  type="text"
                  name="headword"
                  value={formData.headword}
                  onChange={handleInputChange}
                  placeholder="ጀዶ"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the word in Harari script (Ethiopic)
                </p>
              </div>

              {/* Part of Speech */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Part of Speech</label>
                <select
                  name="partOfSpeech"
                  value={formData.partOfSpeech}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="preposition">Preposition</option>
                  <option value="conjunction">Conjunction</option>
                </select>
              </div>

              {/* Translations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">English</label>
                  <input
                    type="text"
                    name="enTranslation"
                    value={formData.enTranslation}
                    onChange={handleInputChange}
                    placeholder="hand"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amharic</label>
                  <input
                    type="text"
                    name="amTranslation"
                    value={formData.amTranslation}
                    onChange={handleInputChange}
                    placeholder="እጅ"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Arabic</label>
                  <input
                    type="text"
                    name="arTranslation"
                    value={formData.arTranslation}
                    onChange={handleInputChange}
                    placeholder="يد"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Example */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Example Sentence</label>
                <textarea
                  name="example"
                  value={formData.example}
                  onChange={handleInputChange}
                  placeholder="ጀዶ ሪ ማዕመር"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Example Translation
                </label>
                <input
                  type="text"
                  name="exampleTranslation"
                  value={formData.exampleTranslation}
                  onChange={handleInputChange}
                  placeholder="The hand is beautiful"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Etymology */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Etymology (optional)
                </label>
                <textarea
                  name="etymology"
                  value={formData.etymology}
                  onChange={handleInputChange}
                  placeholder="Origin and historical information about the word..."
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Which word would you like to correct?
                </label>
                <input
                  type="text"
                  placeholder="Enter the Harari word..."
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">What needs to be corrected?</label>
                <select className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Translation error</option>
                  <option>Example sentence issue</option>
                  <option>Spelling mistake</option>
                  <option>Etymology correction</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Describe the correction</label>
                <textarea
                  placeholder="Explain what needs to be fixed and why..."
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={5}
                />
              </div>
            </>
          )}

          {/* Submit */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Submit Contribution
            </button>
            <button
              type="reset"
              className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-foreground"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Guidelines */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Contribution Guidelines</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Use the correct Ethiopic (Harari) script for headwords</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Provide translations in at least English</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Include examples of usage when possible</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Be respectful and accurate with linguistic information</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">•</span>
              <span>All contributions will be reviewed by moderators</span>
            </li>
          </ul>
        </div>
      </div>
    </Shell>
  )
}

'use client'

import { Shell } from '@/components/layout/Shell'
import { Globe, Users, Heart, BookOpen } from 'lucide-react'

export default function AboutPage() {
  return (
    <Shell>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            About RAAFAT Dictionary
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Preserving and celebrating the Harari language through collaborative dictionary building
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-card border border-border rounded-lg p-8 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
          <p className="text-muted-foreground text-lg">
            The RAAFAT Dictionary is dedicated to preserving and documenting the Harari language, one of the oldest and most unique languages spoken in the Horn of Africa. By creating an accessible, community-driven dictionary, we aim to support language learners, researchers, and culture enthusiasts in understanding and speaking this beautiful language.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Multilingual Support</h3>
            <p className="text-muted-foreground">
              Translations in English, Amharic, and Arabic to help learners from different backgrounds
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Community Driven</h3>
            <p className="text-muted-foreground">
              Built by native speakers, linguists, and language enthusiasts working together
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Cultural Preservation</h3>
            <p className="text-muted-foreground">
              Ensuring that the Harari language and culture are preserved for future generations
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Quality Content</h3>
            <p className="text-muted-foreground">
              All entries are verified by native speakers and linguists for accuracy
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">4+</p>
              <p className="text-muted-foreground mt-2">Languages Supported</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">1000+</p>
              <p className="text-muted-foreground mt-2">Dictionary Entries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-muted-foreground mt-2">Active Contributors</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-muted-foreground mt-2">Community Owned</p>
            </div>
          </div>
        </div>

        {/* Get Involved */}
        <div className="bg-card border border-border rounded-lg p-8 space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Get Involved</h2>
          <p className="text-muted-foreground">
            Help us grow the RAAFAT Dictionary by contributing translations, examples, corrections, and feedback. Every contribution helps preserve this important language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a
              href="/contribute"
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Start Contributing
            </a>
            <a
              href="/review"
              className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-foreground"
            >
              Review Contributions
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center space-y-4 border-t border-border pt-8">
          <h2 className="text-2xl font-bold text-foreground">Questions?</h2>
          <p className="text-muted-foreground">
            Reach out to us at{' '}
            <a href="mailto:info@raafat.org" className="text-primary hover:underline">
              info@raafat.org
            </a>
          </p>
        </div>
      </div>
    </Shell>
  )
}

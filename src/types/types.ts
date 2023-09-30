import { Type, Static } from '@sinclair/typebox'
import { metaPresets } from '../utils/metaPresets'
import { RedditStory } from '../../lib/scraper'

const ContentInput = Type.Object({
    metaPreset: Type.String(),
    keywords: Type.Array(Type.String()),
    topic: Type.Optional(Type.String()),
    outline: Type.Optional(Type.String()),
})

export type ContentInput = RedditStory & Static<typeof ContentInput>

const GeneratedContent = Type.Object({
    title: Type.String(),
    body: Type.String(),
})

export type GeneratedContent = Static<typeof GeneratedContent>

const AIModelResponse = Type.Object({
    text: Type.String(),
})

export type AIModelResponse = Static<typeof AIModelResponse>

export type MetaPreset = keyof typeof metaPresets

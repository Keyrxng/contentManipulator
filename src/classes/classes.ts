import { OpenAI } from 'langchain/llms/openai'
import { RedditScraper } from '../../lib/scraper/dist/classes'
import { RedditStory } from '../../lib/scraper/dist/types'
import * as dotenv from 'dotenv'
import {
    metaPresets,
    metadataPrompt,
    monologuePrompt,
} from '../utils/promptUtils'
import { LLMChain } from 'langchain/chains'
import { ChainValues } from 'langchain/dist/schema'
import { ContentWithMetadata } from '../types'

dotenv.config()

class ContentGenerator {
    private scraper: RedditScraper
    private llm: OpenAI
    private apiKey?: string =
        process.env.OPENAI_API_KEY || dotenv.config().parsed?.OPENAI_API_KEY
    private lovoApiKey?: string =
        process.env.LOVO_TTS_KEY || dotenv.config().parsed?.LOVO_TTS_KEY

    constructor() {
        this.scraper = new RedditScraper()
        this.llm = new OpenAI({
            openAIApiKey: this.apiKey,
            modelName: 'gpt-3.5-turbo-16k',
            maxTokens: -1,
        })
    }

    async generateContent(
        subreddit: string,
        sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial',
        amount: number,
        metaPreset: keyof typeof metaPresets,
        additional?: string[]
    ): Promise<ContentWithMetadata[]> {
        const posts: RedditStory[] = []

        try {
            const res = await this.scraper.fetchSubreddits(
                [subreddit],
                sort,
                amount
            )
            res.forEach((post) => {
                posts.push(post)
            })
        } catch (err) {
            console.log(err)
        }

        const prompts = posts.map((post) => {
            return {
                title: post.title,
                body: post.post.content,
            }
        })

        const contentPromises: Promise<ContentWithMetadata>[] = []

        if (metaPreset.includes('List')) {
            const formattedPrompt = await metaPresets[metaPreset].format({
                content: JSON.stringify(prompts),
            })
            console.log('=====================================')
            console.log('Generating content with prompt...')
            const time = Date.now()
            const llmCompletion = await this.llm.predict(formattedPrompt)
            const timeTaken = Date.now() - time
            console.log('=====================================')
            console.log('Generated in:', timeTaken, 'ms')
            const metadata = await this.extractMetadata(llmCompletion)

            const monologue = await this.monologue(
                llmCompletion,
                additional || []
            )

            const contentWithMetadata = {
                content: llmCompletion,
                metadata: metadata,
                monologue: monologue,
            }

            return [contentWithMetadata]
        } else {
            const promises = prompts.map(async (prompt) => {
                const formattedPrompt = await metaPresets[metaPreset].format({
                    content: `Title: ${prompt.title}\n \n Script: ${prompt.body}`,
                })
                console.log('=====================================')
                console.log('Generating content...')
                console.log('Prompt:', formattedPrompt)
                const time = Date.now()
                const llmCompletion = await this.llm.predict(formattedPrompt)
                const timeTaken = Date.now() - time
                console.log('Generated in:', timeTaken, 'ms')
                console.log('llmCompletion:', llmCompletion)
                console.log('=====================================')

                console.log('=====================================')
                console.log('Generating metadata...')
                const time1 = Date.now()
                const metadata = await this.extractMetadata(llmCompletion)
                const time1Taken = Date.now() - time1
                console.log('Generated in:', time1Taken, 'ms')
                console.log('=====================================')

                console.log('=====================================')
                console.log('Generating monologue...')
                const time2 = Date.now()
                const monologue = await this.monologue(
                    llmCompletion,
                    additional || []
                )
                const time2Taken = Date.now() - time2
                console.log('Generated in:', time2Taken, 'ms')
                console.log('monologue:', monologue)
                console.log('=====================================')

                const contentWithMetadata: ContentWithMetadata = {
                    content: llmCompletion,
                    monologue: monologue,
                    metadata: metadata,
                }

                return contentWithMetadata
            })
            contentPromises.push(...promises)
        }

        const content = await Promise.all(contentPromises)

        return content
    }

    async extractMetadata(content: string): Promise<ChainValues> {
        const chain = new LLMChain({
            llm: this.llm,
            prompt: metadataPrompt,
        })

        const time = Date.now()
        const metadata = await chain.call({ story_content: content })
        const timeTaken = Date.now() - time

        console.log('metadata: ', metadata)

        console.log('=====================================')
        console.log('Extracted in:', timeTaken, 'ms')
        console.log('=====================================')

        return metadata
    }

    // ["Be a motivational speaker", "Aggression and Warriorism", "Be witty and humorous"]
    async monologue(content: string, additional: string[]): Promise<string> {
        const adds = additional.map((adj) => `* ${adj}`).join('\n') || ''
        const formattedPrompt = await monologuePrompt.format({
            additional_info: adds,
            monologue: content,
        })
        console.log('=====================================')
        console.log('Generating monologue...')
        const time = Date.now()
        const llmCompletion = await this.llm.predict(formattedPrompt)
        const timeTaken = Date.now() - time
        console.log('=====================================')
        console.log('Generated in:', timeTaken, 'ms')

        // might break this into a command which takes a path to the monologues folder
        // const tts = await this.textToSpeech(llmCompletion)

        return llmCompletion
    }

    async textToSpeech(content: string): Promise<string> {
        if (!this.lovoApiKey) throw new Error('No lovo api key provided')

        const createJobOptions = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'X-API-KEY': this.lovoApiKey,
            },
            body: JSON.stringify({
                text: content,
                speed: 1,
            }),
        }

        const createJobResponse = await fetch(
            'https://api.genny.lovo.ai/api/v1/tts',
            createJobOptions
        )
        const createJobJson = await createJobResponse.json()
        const jobId = createJobJson.id

        const retrieveJobOptions = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'X-API-KEY': this.lovoApiKey,
            },
        }

        const retrieveJobResponse = await fetch(
            `https://api.genny.lovo.ai/api/v1/tts/${jobId}`,
            retrieveJobOptions
        )
        const retrieveJobJson = await retrieveJobResponse.json()

        const audioUrl = retrieveJobJson.audioUrl

        return audioUrl
    }
}

export { ContentGenerator }

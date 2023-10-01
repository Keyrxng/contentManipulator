import { OpenAI } from 'langchain/llms/openai'
import { RedditScraper } from '../../lib/scraper/dist/classes'
import { RedditStory } from '../../lib/scraper/dist/types'
import * as dotenv from 'dotenv'
import {
    benchmarkPrompt,
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

    async getPosts(
        subreddit: string,
        sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial',
        amount: number
    ): Promise<RedditStory[]> {
        const posts: RedditStory[] = []

        const criteria = {
            minWordCount: 1500,
            minCommentCount: 1,
            minUpvotes: 10,
        }

        try {
            const res = await this.scraper.fetchSubreddits(
                [subreddit],
                sort,
                amount
            )
            res.forEach((post) => {
                console.log('==========================')
                console.log('Post: ', post.title)
                console.log('Word Count: ', post.wordCount)
                console.log('Comments Count: ', post.commentsCount)
                console.log('Upvotes: ', post.upvotes)
                console.log('==========================')
                if (post.wordCount < criteria.minWordCount) {
                    return
                }

                if (post.commentsCount < criteria.minCommentCount) {
                    return
                }

                if (post.upvotes < criteria.minUpvotes) {
                    return
                }

                posts.push(post)
            })
        } catch (err) {
            console.log(err)
        }

        posts.sort((a, b) => {
            return b.upvotes - a.upvotes
        })

        if (posts.length > 10) {
            console.log('==========================')
            console.log(`Truncating posts to 5 from ${posts.length}`)
            posts.splice(5, posts.length - 5)
        }

        return posts
    }

    async generateContent(
        subreddit: string,
        sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial',
        amount: number,
        metaPreset: keyof typeof metaPresets,
        additional?: string[]
    ): Promise<ContentWithMetadata[]> {
        const posts = await this.getPosts(subreddit, sort, amount)

        console.log('==========================')
        console.log('Posts: ', posts.length)
        console.log('==========================')

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
            const time = Date.now()

            console.log('==========================')
            console.log('Generating content...')
            console.log('=== PROMPT ===')
            console.log(formattedPrompt)

            const llmCompletion = await this.llm.predict(formattedPrompt)
            const timeTaken = Date.now() - time

            console.log('=== Time Taken ===')
            console.log(timeTaken, 'ms')
            console.log('==========================')

            if (llmCompletion.includes("can't generate")) {
                return []
            }

            console.log('==========================')
            console.log('Extracting metadata...')
            console.log('=== PROMPT ===')
            console.log(llmCompletion)

            const time1 = Date.now()
            const metadata = await this.extractMetadata(llmCompletion)
            const time1Taken = Date.now() - time1

            console.log('=== Time Taken ===')
            console.log(time1Taken, 'ms')
            console.log('==========================')
            console.log('==========================')
            console.log('Generating monologue...')

            const time2 = Date.now()
            const monologue = await this.monologue(
                llmCompletion,
                additional || []
            )
            const time2Taken = Date.now() - time2

            console.log('=== Time Taken ===')
            console.log(time2Taken, 'ms')
            console.log('==========================')

            console.log('==========================')
            console.log('Benchmarking content...')

            const time3 = Date.now()
            const benchmark = await this.benchmarkContent(
                llmCompletion,
                metadata
            )
            const time3Taken = Date.now() - time3

            console.log('=== Time Taken ===')
            console.log(time3Taken, 'ms')

            const contentWithMetadata = {
                title: metadata['Story Title'],
                content: llmCompletion,
                metadata: metadata,
                monologue: monologue,
                benchmark: benchmark,
            }

            return [contentWithMetadata]
        } else {
            const promises = prompts.map(async (prompt, i) => {
                const formattedPrompt = await metaPresets[metaPreset].format({
                    content: `Title: ${prompt.title}\n \n Script: ${prompt.body}`,
                })

                console.log('==========================')
                console.log('Generating content for prompt: ', i)
                console.log('=== PROMPT ===')
                console.log(formattedPrompt)

                const time = Date.now()
                const llmCompletion = await this.llm.predict(formattedPrompt)
                const timeTaken = Date.now() - time

                console.log('=== Time Taken ===')
                console.log(timeTaken, 'ms')
                console.log('==========================')

                if (
                    llmCompletion.includes(
                        "can't generate" ||
                            "won't generate" ||
                            "I'm sorry, I can't" ||
                            'As an AI'
                    )
                ) {
                    return {
                        title: 'undefined',
                        content: 'undefined',
                        metadata: {},
                        monologue: 'undefined',
                        benchmark: 'undefined',
                    }
                }

                console.log('==========================')
                console.log('Extracting metadata for prompt: ', i)

                const time1 = Date.now()
                const metadata = await this.extractMetadata(llmCompletion)
                const time1Taken = Date.now() - time1

                console.log('=== Time Taken ===')
                console.log(time1Taken, 'ms')
                console.log('==========================')

                console.log('==========================')
                console.log('Generating monologue for prompt: ', i)

                const time2 = Date.now()
                const monologue = await this.monologue(
                    llmCompletion,
                    additional || []
                )
                const time2Taken = Date.now() - time2

                console.log('=== Time Taken ===')
                console.log(time2Taken, 'ms')
                console.log('==========================')

                console.log('==========================')
                console.log('Benchmarking content for prompt: ', i)

                const time3 = Date.now()
                const benchmark = await this.benchmarkContent(
                    llmCompletion,
                    metadata
                )
                const time3Taken = Date.now() - time3

                console.log('=== Time Taken ===')
                console.log(time3Taken, 'ms')
                console.log('==========================')

                const contentWithMetadata: ContentWithMetadata = {
                    title: prompt.title,
                    content: llmCompletion,
                    monologue: monologue,
                    metadata: metadata,
                    benchmark: benchmark,
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

        const metadata = await chain.call({ story_content: content })

        return metadata
    }

    // ["Be a motivational speaker", "Aggression and Warriorism", "Be witty and humorous"]
    async monologue(content: string, additional: string[]): Promise<string> {
        const adds = additional.map((adj) => `* ${adj}`).join('\n') || ''
        const formattedPrompt = await monologuePrompt.format({
            additional_info: adds,
            monologue: content,
        })

        const llmCompletion = await this.llm.predict(formattedPrompt)

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

    async benchmarkContent(
        content: string,
        metadata: ChainValues
    ): Promise<string> {
        const prompt = benchmarkPrompt

        const formattedPrompt = await prompt.format({
            story_content: content,
            metadata: JSON.stringify(metadata),
        })

        const llmCompletion = await this.llm.predict(formattedPrompt)

        return llmCompletion
    }
}

export { ContentGenerator }

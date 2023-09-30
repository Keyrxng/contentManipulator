import { OpenAI } from 'langchain/llms/openai'
import { RedditScraper } from '../../lib/scraper/dist/classes'
import { RedditStory } from '../../lib/scraper/dist/types'
import * as dotenv from 'dotenv'
import { metaPresets, metdataPrompt } from '../utils/promptUtils'
import { LLMChain } from 'langchain/chains'
import { ChainValues } from 'langchain/dist/schema'

dotenv.config()

class ContentGenerator {
    private scraper: RedditScraper
    private llm: OpenAI
    private apiKey?: string =
        process.env.OPENAI_API_KEY || dotenv.config().parsed?.OPENAI_API_KEY

    constructor() {
        console.log("ContentGenerator's constructor called")
        console.log('=====================================', this.apiKey)
        this.scraper = new RedditScraper()
        this.llm = new OpenAI({
            openAIApiKey: this.apiKey,
            modelName: 'gpt-3.5-turbo-16k',
            maxTokens: -1,
        })
    }

    async generateContent(
        subreddit: string,
        metaPreset: keyof typeof metaPresets
    ): Promise<{ content: string; metadata: ChainValues }[]> {
        const posts: RedditStory[] = []

        try {
            const res = await this.scraper.fetchSubreddits(
                [subreddit],
                'hot',
                2
            )
            res.forEach((post) => {
                posts.push(post)
            })
        } catch (err) {
            console.log(err)
        }

        const prompts = posts.map((post) => post.post.content)

        const contentPromises = prompts.map(async (prompt) => {
            const formattedPrompt = await metaPresets[metaPreset].format({
                content: prompt,
            })
            console.log('=====================================')
            console.log('Generating content...')
            const time = Date.now()
            const llmCompletion = await this.llm.predict(formattedPrompt)
            const timeTaken = Date.now() - time
            console.log('=====================================')
            console.log('Generated in:', timeTaken, 'ms')
            return llmCompletion
        })

        const content = await Promise.all(contentPromises)

        const metadata = await this.extractMetadata(content)

        const contentWithMetadata = content.map((content, i) => {
            return {
                content,
                metadata: metadata[i],
            }
        })

        return contentWithMetadata
    }

    async extractMetadata(content: string[]): Promise<ChainValues[]> {
        const metadataPromises = content.map(async (story) => {
            console.log('=====================================')
            console.log('Extracting metadata...')

            const chain = new LLMChain({
                llm: this.llm,
                prompt: metdataPrompt,
            })

            const time = Date.now()
            const metadata = await chain.call({ story_content: story })
            const timeTaken = Date.now() - time

            console.log('=====================================')
            console.log('Extracted in:', timeTaken, 'ms')

            return metadata
        })

        const metadataArray = await Promise.all(metadataPromises)
        return metadataArray
    }
}

export { ContentGenerator }

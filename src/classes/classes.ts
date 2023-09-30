import { OpenAI } from 'langchain/llms/openai'
import { RedditScraper } from '../../lib/scraper/dist/classes'
import { metaPresets } from '../utils/metaPresets'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { RedditStory } from '../../lib/scraper/dist/types'
import * as dotenv from 'dotenv'
dotenv.config()

class ContentGenerator {
    private scraper: RedditScraper
    private llm: OpenAI
    private chatModel: ChatOpenAI
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
        this.chatModel = new ChatOpenAI({
            openAIApiKey: this.apiKey,
            modelName: 'gpt-3.5-turbo-16k',
            maxTokens: -1,
        })
    }

    async generateContent(
        subreddit: string,
        metaPreset: keyof typeof metaPresets
    ): Promise<string[]> {
        const posts: RedditStory[] = []

        try {
            const res = await this.scraper.fetchSubreddits(
                [subreddit],
                'hot',
                10
            )
            res.forEach((post) => {
                posts.push(post)
            })
        } catch (err) {
            console.log(err)
        }
        const prompt = await metaPresets[metaPreset].format({
            content: `${posts.map((post) => post.post.content).join('\n\n')}`,
        })

        console.log('=====================================')
        console.log('Using the following prompt:')
        console.log('=====================================')
        console.log(prompt)
        console.log('=====================================')

        console.log('=====================================')
        console.log('Generating content...')
        console.log('=====================================')

        const llmCompletion = await this.llm.predict(prompt)
        console.log('=====================================')
        console.log('LLM Completed...', llmCompletion)
        console.log('=====================================')
        const chatCompletion = await this.chatModel.predict(prompt)
        console.log('=====================================')
        console.log('Chat Model Completed...', chatCompletion)
        console.log('=====================================')

        const content = [llmCompletion, chatCompletion]

        return content
    }
}

// class ValidationService {
//     validateContent(content: string): boolean {
//         return true // Mocked validation for now
//     }
// }

export { ContentGenerator }

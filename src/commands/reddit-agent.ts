import { Command, command, param } from 'clime'
import { AgentGenny, FileWriteTool, RedditContentAgent } from '../classes'
import * as fs from 'fs'

@command({
    description: 'Generate enhanced content from a specified subreddit',
})
export default class extends Command {
    async execute(
        @param({
            description: 'Subreddit name (without r/)',
            required: true,
        })
        subreddit: string,
        @param({
            description: 'Sort type (hot, new, top, rising, controversial)',
            required: true,
        })
        sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial',
        @param({
            description: 'Amount of posts to scrape',
            required: true,
        })
        amount: number,
        @param({
            description: 'Meta preset to use',
            required: true,
        })
        meta:
            | 'top5List'
            | 'top10List'
            | 'scaryStory'
            | 'funnyStory'
            | 'creepyPasta'
            | 'educational',
        @param({
            description: 'Additional info to alter output',
            required: false,
        })
        additional?: string
    ): Promise<void> {
        const genny = new AgentGenny()
        const redditAgent = new RedditContentAgent([genny, new FileWriteTool()])
        const content = await redditAgent.execute(
            `You are the controller agent of Genny, a content generation AI. You are tasked with generating content from a specified subreddit. You must provide the following information to Genny in order to generate the content:
            
            subreddit: ${subreddit} - Be specific with the subreddit name
            sort: ${sort} - hot, new, top, rising, controversial
            amount: ${amount} - The amount of posts to return, use your best judgement.
            meta: ${meta} - The meta preset to use, see below for more information.
            additional: ${additional} - Additional information to alter output (optional)
            
            Evaluation Criteria:
            - Narrative Quality:
                - Originality (Scale: 1-10): Evaluates the uniqueness and originality of the storyline or content.
                - Suspense Building (Scale: 1-10): Rates the effectiveness of suspense-building elements.
                - Resolution Satisfaction (Scale: 1-10): Assesses the satisfaction level of the resolution or climax.
                - Consistency (Scale: 1-10): Measures how consistent the narrative is throughout the content piece.

            - Engagement Metrics:
                - Readability (Scale: 1-10): Evaluates the readability level of the content, considering the targeted audience.
                - Engagement Hook (Scale: 1-10): Assesses the effectiveness of the opening paragraphs in hooking the reader.

            - Relevancy and Timeliness:
                - Topic Relevancy (Scale: 1-10): Evaluates how relevant the content topic is to the specified theme or trending topics.
                - Timeliness (Scale: 1-10): Assesses how timely the content is, considering any recent events or trends related to the theme.

            - Emotional Impact:
                - Fear Factor (Scale: 1-10): Rates the level of fear or creepiness induced by the content.
                - Empathy (Scale: 1-10): Evaluates the level of empathy or emotional connection the reader could have with the characters or storyline.

            - Metadata Quality:
                - Accuracy (Scale: 1-10): Measures the accuracy and relevancy of the extracted metadata.
                - Completeness (Scale: 1-10): Evaluates the completeness of the metadata in capturing the essence of the content.

            - Creative Expression:
                - Imagery (Scale: 1-10): Assesses the quality and effectiveness of descriptive language and imagery used.
                - Dialogue (Scale: 1-10): Evaluates the naturalness and effectiveness of dialogues if present.
                - Humor (Scale: 1-10): Rates the level of humor or comedic elements in the content.
            `
        )

        const writeFile = (data: string) => {
            const filepath = `./data/${subreddit}-${sort}-${amount}-${meta}.md`
            fs.writeFile(filepath, data, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('File written successfully')
            })
        }

        return writeFile(JSON.stringify(content, null, 4))
    }
}

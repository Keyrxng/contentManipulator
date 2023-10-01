import { Command, command, param } from 'clime'
import { ContentGenerator } from '../classes/classes'
import { ContentWithMetadata, MetaPreset } from '../types'
import { writeToFile } from '../utils/writeToFile'

@command({
    description: 'Generate content based on a subreddit and meta preset',
})
export default class extends Command {
    async execute(
        @param({
            description: 'Subreddit name (without r/)',
            required: true,
        })
        subreddit: string,
        @param({
            description:
                'Meta preset name (top5List, top10List, scaryStory, funnyStory, creepyPasta, educational)',
            required: true,
        })
        metaPreset: string,
        @param({
            description: 'Amount of posts to scrape',
            required: true,
        })
        amount: number,
        @param({
            description: 'Sort type (hot, new, top, rising, controversial)',
            required: true,
        })
        sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial',
        @param({
            description: 'Additional info to alter output',
            required: false,
        })
        additional?: string[]
    ): Promise<ContentWithMetadata[]> {
        const contentGenerator = new ContentGenerator()
        const content = await contentGenerator.generateContent(
            subreddit,
            sort,
            amount,
            metaPreset as MetaPreset,
            additional
        )

        content.map((content, i) => {
            writeToFile(`${subreddit}-${metaPreset}-${i}`, content)
        })

        return content
    }
}

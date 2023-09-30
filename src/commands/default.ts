import { Command, command, param } from 'clime'
import { ContentGenerator } from '../classes/classes'
import { MetaPreset } from '../types'

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
            description: 'Meta preset name',
            required: true,
        })
        metaPreset: string
    ): Promise<string[]> {
        const contentGenerator = new ContentGenerator()
        const content = await contentGenerator.generateContent(
            subreddit,
            metaPreset as MetaPreset
        )
        console.log(content)
        return content
    }
}

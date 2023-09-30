import { Command, command, param } from 'clime'
import { ContentGenerator } from '../classes/classes'
import { MetaPreset } from '../types'
import { writeToFile } from '../utils/writeToFile'
import { ChainValues } from 'langchain/dist/schema'

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
    ): Promise<{ content: string; metadata: ChainValues }[]> {
        const contentGenerator = new ContentGenerator()
        const content = await contentGenerator.generateContent(
            subreddit,
            metaPreset as MetaPreset
        )

        content.map((content, i) => {
            writeToFile(`${subreddit}-${metaPreset}-${i}`, content)
        })

        return content
    }
}

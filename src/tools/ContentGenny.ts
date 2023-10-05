import { ContentGeneratorClass } from '../classes/classes'
import { ContentWithMetadata } from '../types'
import { metaPresets } from '../utils/promptUtils'

class ContentGenerationTool {
    private contentGenerator: ContentGeneratorClass

    constructor() {
        this.contentGenerator = new ContentGeneratorClass()
    }

    async generateContent(
        subreddit: string,
        sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial',
        amount: number,
        metaPreset: keyof typeof metaPresets,
        additional?: string[]
    ): Promise<ContentWithMetadata[]> {
        return this.contentGenerator.generateContent(
            subreddit,
            sort,
            amount,
            metaPreset,
            additional
        )
    }
}

export { ContentGenerationTool }

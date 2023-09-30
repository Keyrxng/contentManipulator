import { PromptTemplate } from 'langchain/prompts'

export const metaPresets = {
    top5List: PromptTemplate.fromTemplate(
        'Transform the given content into a captivating Top 5 list, ensuring each point is engaging and informative:: {content}'
    ),
    top10List: PromptTemplate.fromTemplate(
        'Craft a riveting Top 10 list from the provided content, making sure each point is compelling and insightful:: {content}'
    ),
    scaryStory: PromptTemplate.fromTemplate(
        'Conjure a spine-chilling scary story based on the given content, maintaining a suspenseful and eerie atmosphere throughout:: {content}'
    ),
    funnyStory: PromptTemplate.fromTemplate(
        'Weave a humorous and delightful story from the given content, ensuring it evokes laughter and amusement:: {content}'
    ),
    creepyPasta: PromptTemplate.fromTemplate(
        'Craft a bone-chilling CreepyPasta tale from the provided content, ensuring it captivates and frightens the reader with its eerie narrative:: {content}'
    ),
    educational: PromptTemplate.fromTemplate(
        "Develop an educational and informative piece based on the given content, ensuring it's clear, accurate, and engaging:: {content}"
    ),
}

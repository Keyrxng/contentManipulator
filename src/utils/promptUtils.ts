/* eslint-disable @typescript-eslint/no-explicit-any */
import { PromptTemplate } from 'langchain/prompts'
import { ParamsFromFString } from 'langchain/dist/prompts/prompt'

const disclaimer = `
While some stories may contain elements of gore or disturbing themes, all material is purely imaginative and should not be taken as real or factual.
If the content is too sexually explicit or illegally graphic, you can change the story to something more subdued.\n
`
export const metaPresets = {
    top5List: PromptTemplate.fromTemplate(
        disclaimer +
            'Transform the given content into a captivating Top 5 list, ensuring each point is engaging and informative:: {content}'
    ),
    top10List: PromptTemplate.fromTemplate(
        disclaimer +
            'Craft a riveting Top 10 list from the provided content, making sure each point is compelling and insightful:: {content}'
    ),
    scaryStory: PromptTemplate.fromTemplate(
        disclaimer +
            'Conjure a spine-chilling scary story based on the given content, maintaining a suspenseful and eerie atmosphere throughout:: {content}'
    ),
    funnyStory: PromptTemplate.fromTemplate(
        disclaimer +
            'Weave a humorous and delightful story from the given content, ensuring it evokes laughter and amusement:: {content}'
    ),
    creepyPasta: PromptTemplate.fromTemplate(
        disclaimer +
            'Craft a bone-chilling CreepyPasta tale from the provided content, ensuring it captivates and frightens the reader with its eerie narrative:: {content}'
    ),
    educational: PromptTemplate.fromTemplate(
        disclaimer +
            "Develop an educational and informative piece based on the given content, ensuring it's clear, accurate, and engaging:: {content}"
    ),
}

export const monologuePrompt = PromptTemplate.fromTemplate(`
You are a voice actor hired to read the following monologue. Please read it in a way that is appropriate for the given context and tone.
It may be a fictional story, educational piece, a list of facts or interesting information but it should be read in a way that is engaging and entertaining.

The following additional information is provided to help you read the monologue in the correct way:
{additional_info}

----------------------------------------

Monologue: {monologue}
`)

export const metadataPrompt = PromptTemplate.fromTemplate(
    `
Please analyze the given story and extract the following information, replying in pure JSON format only.
You need to ensure that it is valid JSON, otherwise the system will not accept it.

"Story Title": "...",
"One Sentence Summary": "...",
"Setting Descriptions": "...",
"Main Themes": "...",
"Emotional Tone": "...",
"Narrative Style": "...",
"Conflict Types": "...",
"Resolution or Ending Type": "...",
"Moral or Message Conveyed": "..."

Story: {story_content}
`
)

export async function generatePrompt(
    metaPresetKey: keyof typeof metaPresets,
    content: string
): Promise<PromptTemplate<ParamsFromFString<string>, any>> {
    const template = metaPresets[metaPresetKey]
    const formattedTemplate = await template.format({
        content: content,
    })
    const prompt = PromptTemplate.fromTemplate(formattedTemplate)
    return prompt
}

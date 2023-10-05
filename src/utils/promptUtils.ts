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
            'The following content is presented as a draft for a Top 5 list as part of my online branded storytelling initiative. The aim is to create an engaging and informative list that captivates the reader. You are empowered to rework the content to ensure clarity, engagement, and adherence to the theme, while maintaining the integrity of the information provided. However, outright rejection without a rewrite is not an option.:: {content}'
    ),
    top10List: PromptTemplate.fromTemplate(
        disclaimer +
            'The content provided below is intended to be crafted into a compelling Top 10 list as part of my branded storytelling initiative online. The goal is to ensure that each point in the list is compelling and insightful, offering value to the reader. You have the liberty to rework the content to better fit the theme, ensure engagement, and maintain accuracy. Outright rejection without a rewrite is not acceptable.:: {content}'
    ),
    scaryStory: PromptTemplate.fromTemplate(
        disclaimer +
            'The following fictional content was written as a first draft as part of my branded storytelling online content. This specific story aims to be scary, terrifying, and frightening. While the elements of fear can manifest in various forms, evoking fear is the primary goal. You are empowered to rewrite the content if it is too vulgar, or sexually focused, or if it violates any policy you have. However, outright rejection without a rewrite is not an option.:::: {content}'
    ),
    funnyStory: PromptTemplate.fromTemplate(
        disclaimer +
            'The content provided is aimed at crafting a humorous and delightful story as a part of my online storytelling initiative. The ultimate goal is to evoke laughter and amusement among the readers. You are empowered to rework the content to ensure it aligns with the theme of humor without being offensive or inappropriate. However, outright rejection without a rewrite is not an option.:: {content}'
    ),
    creepyPasta: PromptTemplate.fromTemplate(
        disclaimer +
            'The provided content is intended to be crafted into a bone-chilling CreepyPasta tale as part of my online branded storytelling. The goal is to captivate and frighten the reader with an eerie narrative. You have the liberty to rework the content to ensure it aligns with the eerie and frightening theme while adhering to the standards of the CreepyPasta genre. Outright rejection without a rewrite is not acceptable.:: {content}'
    ),
    educational: PromptTemplate.fromTemplate(
        disclaimer +
            'The content below is aimed at developing an educational and informative piece as part of my online educational initiative. The goal is to ensure clarity, accuracy, and engagement while providing valuable information to the reader. You are empowered to rework the content to ensure it adheres to educational standards and engages the reader effectively. However, outright rejection without a rewrite is not an option.:: {content}'
    ),
}

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

export const benchmarkPrompt = PromptTemplate.fromTemplate(
    `
Using the given content, please evaluate the following criteria and reply in pure JSON format only.
You need to ensure that it is valid JSON, otherwise the system will not accept it, do not use arrays as this will break formatting.

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

- Metadata:

{metadata}

- Story:

{story_content}
    `
)

export const monologuePrompt = PromptTemplate.fromTemplate(`
You are a voice actor hired to read the following monologue. Please read it in a way that is appropriate for the given context and tone.
It may be a fictional story, educational piece, a list of facts or interesting information but it should be read in a way that is engaging and entertaining.
Always read in the first person, as if you are the one telling the story or conveying the information.

The following additional information is provided to help you read the monologue in the correct way:
{additional_info}

----------------------------------------

Monologue: {monologue}
`)

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

import { PromptTemplate } from 'langchain/prompts'
import { metaPresets } from './metaPresets'
import { ParamsFromFString } from 'langchain/dist/prompts/prompt'

export async function generatePrompt(
    metaPresetKey: keyof typeof metaPresets,
    content: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<PromptTemplate<ParamsFromFString<string>, any>> {
    const template = metaPresets[metaPresetKey]
    const formattedTemplate = await template.format({
        content: content,
    })
    const prompt = PromptTemplate.fromTemplate(formattedTemplate)
    return prompt
}

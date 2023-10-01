# Content Manipulator


    ██████╗ ██████╗ ██████╗ ██╗   ██╗██████╗  █████╗ ███████╗████████╗ █████╗ ██╗
    ██╔════╝██╔═══██╗██╔══██╗╚██╗ ██╔╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██║
    ██║     ██║   ██║██████╔╝ ╚████╔╝ ██████╔╝███████║███████╗   ██║   ███████║██║
    ██║     ██║   ██║██╔═══╝   ╚██╔╝  ██╔═══╝ ██╔══██║╚════██║   ██║   ██╔══██║██║
    ╚██████╗╚██████╔╝██║        ██║   ██║     ██║  ██║███████║   ██║   ██║  ██║██║
    ╚═════╝ ╚═════╝ ╚═╝        ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝


  ### Generate content based on a subreddit and meta preset

  USAGE
```html
    CopyPastAI <subreddit> <meta-preset> <amount> <sort> [additional]
```
  PARAMETERS
```js

    subreddit   - Subreddit name (without r/)
    meta-preset - Meta preset name (top5List, top10List, scaryStory, funnyStory, creepyPasta, educational)
    amount      - Amount of posts to scrape
    sort        - Sort type (hot, new, top, rising, controversial)
    additional  - Additional info to alter output (optional)
```

## Setup

1. Ensure you have the necessary dependencies installed:
```bash
yarn install
```

2. Make sure to have your OpenAI API key set in .env file:
```bash
OPENAI_API_KEY=your-api-key-here
```

## Usage

1. Create a new instance of the ``ContentGenerator`` class, passing in the desired subreddit and OpenAI API key.

2. Call the ``generateContent()`` method on the ``ContentGenerator`` instance.

3. The output will be a markdown file with a table of metadata and the generated content. Each key-value pair in the metadata is rendered as a row in the markdown table, and the generated content is rendered below the metadata table.

## Customization

1. Meta Presets: Customize your meta presets in the 'metaPresets.ts' file to match the desired formatting and content structure you want.

2. Validation: Implement a validation service to ensure the generated content meets your quality standards before saving it to a file.

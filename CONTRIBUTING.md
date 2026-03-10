# Contributing to Claude Marketplace

Thank you for your interest in contributing!

## Adding a New Skill

1. **Fork this repository**

2. **Create your skill directory**
   ```
   skills/your-skill-name/
   ├── manifest.yaml    # Required: Skill metadata
   └── SKILL.md         # Required: Skill implementation
   ```

3. **Create manifest.yaml**
   ```yaml
   id: your-skill-name
   name: Your Skill Name
   version: 1.0.0
   type: skill
   author: your-github-username
   description: Brief description of what your skill does
   tags:
     - tag1
     - tag2
   ```

4. **Create SKILL.md**

   Use this template:
   ```markdown
   # /your-skill-name - Brief Description

   Description of what the skill does.

   ## Arguments

   - \`$ARGUMENTS\`: Description of arguments

   ## Steps

   ### 1. First step

   \`\`\`bash
   # Your bash code here
   \`\`\`

   ### 2. Second step

   \`\`\`bash
   # More code
   \`\`\`

   ## Example

   \`\`\`
   /your-skill-name arg1 arg2
   \`\`\`
   ```

5. **Update index.yaml**

   Add your skill to the skills list:
   ```yaml
   - id: your-skill-name
     name: Your Skill Name
     version: 1.0.0
     description: Brief description
     author: your-github-username
     path: skills/your-skill-name
     files:
       - manifest.yaml
       - SKILL.md
     tags:
       - tag1
       - tag2
   ```

6. **Submit a Pull Request**

## Guidelines

- Use kebab-case for skill IDs (e.g., `my-skill`, not `mySkill` or `MySkill`)
- Include clear documentation in SKILL.md
- Test your skill before submitting
- Follow the existing directory structure

## Code of Conduct

Be respectful and constructive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

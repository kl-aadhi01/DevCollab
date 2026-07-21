const axios = require('axios');

const breakdownTasks = async (req, res) => {
  try {
    const { description, requiredSkills = [], teamSize = 3 } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Project description is required for AI task breakdown' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            system: "You are an AI software architect and project manager. Return ONLY a valid JSON array of 4 to 6 structured task/milestone objects for the given project idea. Do not include markdown ticks (like ```json), commentary, or extra prose. Format for each item: { \"title\": \"...\", \"description\": \"...\", \"priority\": \"medium\", \"phase\": \"Phase 1: Setup\" }. Priority must be 'low', 'medium', or 'high'.",
            messages: [
              {
                role: 'user',
                content: `Break down this project into tasks:\nDescription: ${description}\nRequired Skills: ${requiredSkills.join(', ')}\nTeam Size: ${teamSize}`
              }
            ]
          },
          {
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json'
            }
          }
        );

        let contentText = response.data.content?.[0]?.text || '[]';
        // Clean markdown backticks if returned
        contentText = contentText.replace(/```json/gi, '').replace(/```/g, '').trim();

        const tasks = JSON.parse(contentText);
        if (Array.isArray(tasks) && tasks.length > 0) {
          return res.json(tasks.map(t => ({ ...t, aiGenerated: true })));
        }
      } catch (anthropicErr) {
        console.warn('Anthropic API call failed or timed out, using fallback generator:', anthropicErr.message);
      }
    }

    // Smart fallback generator if ANTHROPIC_API_KEY is not set or API request fails
    const skillsList = requiredSkills.length > 0 ? requiredSkills.join(', ') : 'full-stack technologies';
    const fallbackTasks = [
      {
        title: 'Architecture & System Design',
        description: `Define database schemas, API routes, and overall technical structure using ${skillsList}.`,
        priority: 'high',
        phase: 'Phase 1: Foundation',
        aiGenerated: true
      },
      {
        title: 'Core UI/UX Wireframing & Setup',
        description: `Build essential layout components and client-side page routing.`,
        priority: 'medium',
        phase: 'Phase 1: Foundation',
        aiGenerated: true
      },
      {
        title: 'Backend API & Business Logic Integration',
        description: `Implement controllers, authentication endpoints, and data validation.`,
        priority: 'high',
        phase: 'Phase 2: Development',
        aiGenerated: true
      },
      {
        title: 'Testing & Optimization Pass',
        description: `Conduct end-to-end user flow testing and optimize component rendering.`,
        priority: 'medium',
        phase: 'Phase 3: Launch',
        aiGenerated: true
      }
    ];

    res.json(fallbackTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error during task breakdown', error: error.message });
  }
};

module.exports = {
  breakdownTasks
};

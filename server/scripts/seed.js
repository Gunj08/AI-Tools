const { sequelize } = require('../config/db');
const Category = require('../models/Category');
const Tool = require('../models/Tool');
const User = require('../models/User');
const slugify = require('slugify');

const categoriesData = [
  { name: "Writing & Content", icon: "✍️", color: "#6366f1", description: "AI writers, editors, copywriting, and blogging assistants." },
  { name: "Image Generation", icon: "🎨", color: "#ec4899", description: "Convert text descriptions into stunning images and art." },
  { name: "Video Creation",   icon: "🎬", color: "#f59e0b", description: "Generate, edit, and animate videos using artificial intelligence." },
  { name: "Code Assistant",   icon: "💻", color: "#10b981", description: "Autocompletion, debugging, and code generation AI tools." },
  { name: "Audio & Music",    icon: "🎵", color: "#8b5cf6", description: "Generate music, vocals, sound effects, and transcribe audio." },
  { name: "Chatbots",         icon: "🤖", color: "#3b82f6", description: "Conversational agents, virtual assistants, and chat interfaces." },
  { name: "SEO & Marketing",  icon: "📈", color: "#ef4444", description: "Optimize web contents, run marketing campaigns, and analyze traffic." },
  { name: "Research",         icon: "🔬", color: "#14b8a6", description: "Read papers, extract summaries, and accelerate academic search." },
  { name: "Productivity",     icon: "⚡", color: "#f97316", description: "Automate tasks, manage emails, and optimize your work schedule." },
  { name: "Design",           icon: "🖌️", color: "#a855f7", description: "Create mockups, remove backgrounds, and build beautiful UI/UX." },
];

const seedDB = async () => {
  try {
    console.log('Ensuring MySQL database exists...');
    const mysql = require('mysql2/promise');
    const dbName = process.env.DB_NAME || 'aitools';
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    console.log(`Database '${dbName}' verified/created.`);

    console.log('Connecting to MySQL database for seeding...');
    await sequelize.authenticate();
    console.log('Connected to MySQL.');

    console.log('Syncing database (force: true) to clear tables...');
    await sequelize.sync({ force: true });
    console.log('Tables recreated successfully.');

    // Seed Categories
    console.log('Seeding categories...');
    const categoriesWithSlugs = categoriesData.map(cat => ({
      ...cat,
      slug: slugify(cat.name, { lower: true, strict: true })
    }));
    const createdCategories = await Category.bulkCreate(categoriesWithSlugs);
    console.log(`${createdCategories.length} categories seeded.`);

    // Helper to get category ID by name
    const getCatId = (name) => {
      const cat = createdCategories.find(c => c.name === name);
      return cat ? cat.id : null;
    };

    // Seed Admin User
    console.log('Seeding admin user...');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'adminpassword123', // Will be hashed in model save hook
      role: 'admin'
    });
    console.log(`Admin user created: email = ${adminUser.email}, password = adminpassword123`);

    // Seed Tools Data definition
    const toolsData = [
      {
        name: "ChatGPT",
        description: "ChatGPT is a state-of-the-art conversational AI developed by OpenAI. It excels in writing, brainstorming, coding, text editing, translating, and answering complex questions with deep knowledge and nuance.",
        shortDesc: "Conversational AI agent capable of writing, code generation, and answering questions.",
        categoryId: getCatId("Chatbots"),
        tags: ["openai", "gpt-4", "llm", "chatbot"],
        websiteUrl: "https://chat.openai.com",
        logoUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=150&auto=format&fit=crop&q=80",
        pricing: "Freemium",
        rating: 4.8,
        featured: true,
        approved: true,
        votes: 184
      },
      {
        name: "Midjourney",
        description: "Midjourney is an independent research lab producing a proprietary artificial intelligence program under the same name that creates images from textual descriptions, similar to OpenAI's DALL-E and Stability AI's Stable Diffusion.",
        shortDesc: "Generate stunning hyper-realistic images and digital art from text descriptions.",
        categoryId: getCatId("Image Generation"),
        tags: ["art", "design", "midjourney", "image-gen"],
        websiteUrl: "https://www.midjourney.com",
        logoUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=80",
        pricing: "Paid",
        rating: 4.7,
        featured: true,
        approved: true,
        votes: 142
      },
      {
        name: "Claude",
        description: "Claude is a next-generation AI assistant developed by Anthropic. It is built on constitutional AI principles to be helpful, honest, and harmless. It is capable of advanced reasoning, document summarization, coding, and writing.",
        shortDesc: "Advanced conversational assistant focusing on safe, helpful reasoning and high context window.",
        categoryId: getCatId("Chatbots"),
        tags: ["anthropic", "claude-3", "llm", "writing"],
        websiteUrl: "https://claude.ai",
        logoUrl: "https://images.unsplash.com/photo-1547989453-11e67ffb3885?w=150&auto=format&fit=crop&q=80",
        pricing: "Freemium",
        rating: 4.9,
        featured: true,
        approved: true,
        votes: 196
      },
      {
        name: "v0.dev",
        description: "v0 is a generative UI system by Vercel. It generates production-ready React code styled with Tailwind CSS and shadcn/ui components based on simple text prompts, making UI design and development incredibly rapid.",
        shortDesc: "Generate production-ready React and Tailwind CSS layouts from text prompts.",
        categoryId: getCatId("Code Assistant"),
        tags: ["vercel", "react", "tailwind", "ui-gen"],
        websiteUrl: "https://v0.dev",
        logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
        pricing: "Freemium",
        rating: 4.6,
        featured: true,
        approved: true,
        votes: 115
      },
      {
        name: "GitHub Copilot",
        description: "GitHub Copilot is an AI pair programmer developed by GitHub and OpenAI. It integrates directly into IDEs like VS Code and JetBrains to suggest code lines, functions, tests, and complete files in real-time.",
        shortDesc: "AI pair programmer suggesting code inside your IDE in real time.",
        categoryId: getCatId("Code Assistant"),
        tags: ["github", "vscode", "coding", "copilot"],
        websiteUrl: "https://github.com/features/copilot",
        logoUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=150&auto=format&fit=crop&q=80",
        pricing: "Paid",
        rating: 4.5,
        featured: false,
        approved: true,
        votes: 89
      },
      {
        name: "Jasper AI",
        description: "Jasper is an AI writing platform designed for content creators, marketers, and businesses. It offers templates for SEO blog posts, social media updates, email newsletters, and landing pages to boost writing efficiency.",
        shortDesc: "AI copywriting platform for business, SEO, and marketing content creation.",
        categoryId: getCatId("Writing & Content"),
        tags: ["copywriting", "seo", "blogging", "marketing"],
        websiteUrl: "https://www.jasper.ai",
        logoUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150&auto=format&fit=crop&q=80",
        pricing: "Paid",
        rating: 4.4,
        featured: false,
        approved: true,
        votes: 63
      },
      {
        name: "Suno AI",
        description: "Suno is a generative AI model that produces realistic audio, music, and vocals. Users can generate complete songs with lyrics, melody, and specific instrumentation based on a text prompt.",
        shortDesc: "Generate full songs including lyrics, vocals, and instruments from text.",
        categoryId: getCatId("Audio & Music"),
        tags: ["music-gen", "audio", "suno", "creative"],
        websiteUrl: "https://suno.com",
        logoUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
        pricing: "Freemium",
        rating: 4.6,
        featured: true,
        approved: true,
        votes: 121
      },
      {
        name: "Canva Magic Studio",
        description: "Canva Magic Studio introduces suite of AI design tools built into Canva's graphic editor. It offers features like text-to-image, background remover, magic edit, magic write, and instant presentation decks builder.",
        shortDesc: "A complete suite of AI design features integrated directly into Canva.",
        categoryId: getCatId("Design"),
        tags: ["canva", "graphics", "templates", "design-tool"],
        websiteUrl: "https://www.canva.com",
        logoUrl: "https://images.unsplash.com/photo-1561070791-26c113006238?w=150&auto=format&fit=crop&q=80",
        pricing: "Freemium",
        rating: 4.4,
        featured: false,
        approved: true,
        votes: 78
      },
      {
        name: "Consensus",
        description: "Consensus is an AI search engine that reads, analyzes, and extracts scientific findings directly from peer-reviewed research papers. It provides evidence-based answers with citation links.",
        shortDesc: "AI search engine that extracts evidence-based answers from scientific research.",
        categoryId: getCatId("Research"),
        tags: ["science", "research", "search-engine", "citations"],
        websiteUrl: "https://consensus.app",
        logoUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=150&auto=format&fit=crop&q=80",
        pricing: "Freemium",
        rating: 4.5,
        featured: false,
        approved: true,
        votes: 54
      },
      {
        name: "Stable Diffusion",
        description: "Stable Diffusion is a latent text-to-image diffusion model capable of generating photo-realistic images given any text input. It is fully open-source and customizable for local usage.",
        shortDesc: "Open-source text-to-image generation model with high customizability.",
        categoryId: getCatId("Image Generation"),
        tags: ["stability", "open-source", "image-gen", "local-run"],
        websiteUrl: "https://stability.ai",
        logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
        pricing: "Open Source",
        rating: 4.7,
        featured: false,
        approved: true,
        votes: 110
      }
    ];

    console.log('Seeding tools...');
    const toolsWithSlugs = toolsData.map(tool => ({
      ...tool,
      slug: slugify(tool.name, { lower: true, strict: true })
    }));

    const seededTools = await Tool.bulkCreate(toolsWithSlugs);
    console.log(`${seededTools.length} tools seeded.`);

    console.log('MySQL Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('MySQL Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();

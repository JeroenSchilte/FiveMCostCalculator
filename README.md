# FiveM Job Tracker - Static Demo

A community-driven FiveM job profitability tracker that helps you log and analyze different money-making activities to determine which jobs provide the best hourly income rates.

## 🎮 Demo Features

- **Job Session Tracking**: Log sessions with job type, duration (in minutes), earnings, and expenses
- **Real-time Analytics**: Calculate and display average hourly rates for each job type
- **Profitability Rankings**: See community-wide rankings and comparisons
- **Interactive Charts**: Visual data with Chart.js for hourly comparisons and time distribution
- **Session History**: Detailed table with filtering and pagination
- **CSV Export**: Export all data for external analysis
- **localStorage Persistence**: Data persists in your browser

## 🚀 Live Demo

Visit the live demo: [FiveM Job Tracker](https://yourusername.github.io/fivem-job-tracker/)

## 📱 Screenshot

![FiveM Job Tracker Dashboard](screenshot.png)

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/fivem-job-tracker.git
cd fivem-job-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Build static site
npm run build:static

# Preview static build
npm run preview:static
```

## 📊 Default Job Types

The demo comes pre-loaded with common FiveM jobs:
- Breaking Rocks
- Growing Weed
- Cocaine Making
- Trucking
- Boosting

You can add custom job types through the interface.

## 💾 Data Storage

This static demo uses browser localStorage for data persistence. Your data will persist between sessions but is only stored locally on your device.

## 🎨 Design

Inspired by Discord's UI design with a dark gaming theme:
- **Colors**: Discord purple (#7289DA), success green (#43B581), dark backgrounds
- **Typography**: Roboto font family
- **Layout**: Card-based responsive design
- **Theme**: Dark mode optimized for gaming

## 📁 Project Structure

```
├── client/src/           # React frontend
│   ├── components/       # UI components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities and localStorage
│   └── pages/           # Page components
├── .github/workflows/   # GitHub Actions
└── vite.config.static.ts # Static build configuration
```

## 🔧 Technologies

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Radix UI primitives, shadcn/ui components, Tailwind CSS
- **Charts**: Chart.js
- **Forms**: React Hook Form with Zod validation
- **Storage**: Browser localStorage
- **Deployment**: GitHub Pages

## 📈 Usage

1. **Log Job Sessions**: Use the form to log new job sessions with duration, earnings, and expenses
2. **View Rankings**: See which jobs are most profitable based on community data
3. **Analyze Trends**: Use the charts to visualize profitability and time distribution
4. **Export Data**: Download your session data as CSV for external analysis
5. **Track Progress**: Monitor your personal stats including total earned and best hourly rate

## 🤝 Contributing

This is a demo repository. For the full-featured version with authentication and database storage, please contact the development team.

## 📄 License

MIT License - feel free to use this code for your own projects.
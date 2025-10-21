# Community Voice - ESG Grievance Management System

A beautiful, multilingual web application for collecting and managing community grievances in African mining contexts. Built with React, TypeScript, and Supabase.

---

## What This Application Does

Imagine you're working with a mining company in South Africa, and you need a way for local communities to report concerns safely and easily. This app does exactly that!

**For Community Members:**
- Submit complaints or concerns (called "grievances") about mining operations
- Choose to submit in English or Afrikaans
- Share their location automatically using GPS, or type it manually
- Remain anonymous if they want to
- Get a reference number to track their submission

**For Company Staff:**
- View all grievances in one organized dashboard
- See urgent issues highlighted immediately
- Filter grievances by date, location, category, urgency, and more
- Click on charts to instantly filter data
- Track which submissions came from GPS vs manual entry

---

## Key Features

### 🌍 Multilingual Support
- **English and Afrikaans** translations throughout the form
- Easy language switcher at the top of the form
- Detects what language the grievance was submitted in

### 📍 Smart Location Tracking
- **GPS Auto-Capture**: Click a button to automatically grab precise coordinates
- **Manual Entry**: Type location names like "Site 3" or "Worker Camp B"
- **Visual Indicators**: GPS coordinates show with a pin icon
- **Tooltip**: Hover over locations to see if they were GPS-captured or manually entered

### 🚨 Automatic Urgency Detection
The app reads the description and automatically assigns urgency:
- **HIGH**: Keywords like "urgent", "emergency", "danger", "sick"
- **MEDIUM**: Keywords like "serious", "problem", "concern"
- **LOW**: Everything else

Works in both English and Afrikaans!

### 🎯 Powerful Dashboard

**Stats at a Glance:**
- Total grievances
- Count by urgency level (High, Medium, Low)
- **Click any stat card to filter the table!**

**Category Charts:**
- Visual bars showing grievances by category
- Environmental, Land Disputes, Labor Issues, Health & Safety, Other
- **Click any bar to filter by that category!**

**Advanced Filtering:**
- Date range (from/to)
- Name search
- Location search
- Category dropdown
- Urgency dropdown
- Description search
- "Clear All" button to reset filters
- See filtered count vs total count

**Smart Table:**
- Shows all filtered grievances
- Hover over rows for better readability
- GPS coordinates with pin icons
- Color-coded urgency badges
- Tooltips showing capture method

---

## Technology Stack

### Frontend
- **React 18** - The UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Super fast build tool
- **Tailwind CSS** - Beautiful, responsive styling
- **Lucide React** - Clean, modern icons

### Backend
- **Supabase** - PostgreSQL database with real-time features
- Handles all data storage
- Row Level Security (RLS) for data protection
- No backend code needed!

### Browser Features
- **Geolocation API** - For GPS coordinate capture
- Works on mobile and desktop browsers

---

## Database Structure

### Grievances Table
Every submission is stored with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier (auto-generated) |
| `submitted_language` | TEXT | "English" or "Afrikaans" |
| `submitter_name` | TEXT | Optional, can be anonymous |
| `submitter_contact` | TEXT | Optional phone/email |
| `location_text` | TEXT | Location description |
| `latitude` | DECIMAL | GPS latitude (if captured) |
| `longitude` | DECIMAL | GPS longitude (if captured) |
| `location_method` | TEXT | "browser_auto" or "manual" |
| `content` | TEXT | The grievance description (required) |
| `category` | TEXT | environmental, land_dispute, labor_issue, health_safety, other |
| `urgency` | TEXT | high, medium, low (auto-detected) |
| `status` | TEXT | new, in_progress, resolved, closed |
| `created_at` | TIMESTAMP | When submitted |
| `updated_at` | TIMESTAMP | Last modified |

---

## How It Works

### Submission Flow
1. User visits the site and sees the form
2. They select their language (English/Afrikaans)
3. Optionally enter name and contact info
4. For location, they either:
   - Click "Use My Current Location" (browser asks permission)
   - Type in a location name
5. Describe their grievance in the text area
6. Select a category (optional)
7. Click submit
8. App automatically detects urgency from keywords
9. Grievance saved to database
10. User sees success message with reference ID

### Dashboard Flow
1. Staff clicks "Dashboard" in navigation
2. See statistics cards at the top
3. Click any urgency card to filter by that level
4. View category chart below
5. Click any category bar to filter by that category
6. Use filter inputs above the table for detailed searches
7. Table updates instantly as filters are applied
8. Hover over GPS locations to see capture method
9. Clear filters anytime with "Clear All"

---

## Setup Instructions

### Prerequisites
- Node.js 16 or higher
- A Supabase account (free tier works great)
- A code editor (VS Code recommended)

### Step 1: Clone and Install
```bash
# Install dependencies
npm install
```

### Step 2: Database Setup
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning (~2 minutes)
4. The migration file is already included at:
   `supabase/migrations/20251021031202_create_grievances_table.sql`
5. In Supabase dashboard, go to SQL Editor
6. Copy and paste the migration content
7. Run it to create the table

### Step 3: Environment Variables
1. Copy `.env` file in project root
2. Get your Supabase credentials:
   - Go to Project Settings → API
   - Copy `Project URL` and `anon/public key`
3. Update `.env`:
```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run Locally
```bash
# Start development server
npm run dev
```
Visit `http://localhost:5173` in your browser!

### Step 5: Load Sample Data
1. Click "Dashboard" in the navigation
2. Click "Load Sample Data" button
3. 12 realistic grievances will be added
4. Now you can test all the filtering features!

---

## Deployment to Netlify

### Quick Deploy (Drag & Drop)
1. Build the app: `npm run build`
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to the page
4. Go to Site Settings → Environment Variables
5. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Trigger a redeploy

### Git-Based Deploy (Recommended)
1. Push code to GitHub/GitLab
2. Go to [netlify.com](https://netlify.com)
3. "Add new site" → "Import an existing project"
4. Connect your repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables
7. Deploy!

---

## Project Structure

```
project/
├── src/
│   ├── App.tsx                 # Main app component with form
│   ├── Dashboard.tsx           # Dashboard with stats and filters
│   ├── lib/
│   │   └── supabase.ts        # Supabase client configuration
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles
├── supabase/
│   └── migrations/
│       └── create_grievances_table.sql  # Database schema
├── dist/                       # Build output (created by npm run build)
├── .env                        # Environment variables (not in git)
├── package.json               # Dependencies
└── vite.config.ts            # Vite configuration
```

---

## Features Breakdown

### Form Page Features
- ✅ Language toggle (English/Afrikaans)
- ✅ Optional name field
- ✅ Optional contact field
- ✅ GPS location capture with permission handling
- ✅ Manual location text entry
- ✅ Location helper text
- ✅ Required grievance description (textarea)
- ✅ Optional category selector
- ✅ Automatic urgency detection
- ✅ Form validation
- ✅ Success/error messages
- ✅ Auto-clear form after submission
- ✅ Reference ID provided after submission
- ✅ Beautiful gradient header with icon
- ✅ Responsive design for mobile/tablet/desktop

### Dashboard Features
- ✅ Real-time data from Supabase
- ✅ Total grievances count
- ✅ Urgency breakdown (High/Medium/Low)
- ✅ **Clickable stat cards to filter**
- ✅ Category distribution chart
- ✅ **Clickable category bars to filter**
- ✅ Sample data loader (12 realistic entries)
- ✅ Refresh button to reload data
- ✅ Date range filters (from/to)
- ✅ Name search filter
- ✅ Location search filter
- ✅ Category dropdown filter
- ✅ Urgency dropdown filter
- ✅ Description search filter
- ✅ "Clear All Filters" button
- ✅ Active filter indicators
- ✅ Filtered count display
- ✅ Table with all grievances
- ✅ Hover effects on table rows
- ✅ GPS pin icon for coordinates
- ✅ Tooltips showing capture method
- ✅ Date formatting
- ✅ Anonymous display for unnamed submissions
- ✅ Responsive grid layout

### Design Features
- ✅ Modern gradient backgrounds
- ✅ Smooth transitions throughout
- ✅ Hover effects on interactive elements
- ✅ Shadow depth hierarchy
- ✅ Color-coded urgency badges
- ✅ Consistent 6-pixel spacing system
- ✅ Focus states on all inputs
- ✅ Loading states for async operations
- ✅ Error handling with user feedback
- ✅ Accessible color contrast
- ✅ Mobile-responsive design
- ✅ Professional footer

---

## Security Features

### Row Level Security (RLS)
The database has RLS enabled, which means:
- Public can insert new grievances (submit form)
- Public can read grievances (view dashboard)
- Only authenticated users could update/delete (future feature)

### Data Privacy
- Names and contact info are optional
- Users can submit completely anonymously
- No tracking cookies or analytics
- Location sharing requires explicit browser permission

### Environment Variables
- Database credentials never exposed in code
- `.env` file excluded from Git
- Production secrets managed in Netlify

---

## Customization Guide

### Change Languages
Edit `translations` object in `src/App.tsx` to add more languages or modify existing ones.

### Add Categories
Update the category options in both:
- `src/App.tsx` (form dropdown)
- `src/Dashboard.tsx` (filter and display logic)
- Database accepts any category value

### Modify Urgency Keywords
Edit the `detectUrgency()` function in `src/App.tsx`:
```typescript
const highKeywords = ['urgent', 'emergency', ...];
const mediumKeywords = ['serious', 'problem', ...];
```

### Styling Changes
- Colors: Edit Tailwind classes throughout components
- Spacing: Uses consistent gap-6 and p-6 patterns
- Gradients: Search for `gradient-to` classes
- Shadows: Search for `shadow-` classes

---

## Troubleshooting

### "No grievances found"
- Check Supabase connection in browser console
- Verify environment variables are set correctly
- Make sure database table was created
- Try loading sample data

### GPS not working
- Browser must support Geolocation API
- User must grant location permission
- HTTPS required in production (Netlify provides this)
- If denied, users can still enter location manually

### Build fails
- Run `npm install` to ensure all dependencies
- Check Node.js version (16+)
- Clear `node_modules` and reinstall if needed
- Check for TypeScript errors: `npm run typecheck`

### Deployment issues on Netlify
- Verify build command is `npm run build`
- Verify publish directory is `dist`
- Check environment variables are set
- Look at deploy logs for specific errors

---

## Future Enhancement Ideas

- 🔐 Admin authentication for dashboard
- 📧 Email notifications for new grievances
- 🗺️ Interactive map view of grievances
- 📊 Advanced analytics and reporting
- 📱 Mobile app version
- 🔔 Real-time updates using Supabase subscriptions
- 📎 File upload support (photos/documents)
- 💬 Comments/responses on grievances
- 🏷️ Custom tagging system
- 📈 Export to CSV/Excel
- 🌐 More language support (Zulu, Xhosa, etc.)
- 🔍 Full-text search
- 📅 Calendar view of submissions

---

## Support & Contributing

### Getting Help
- Check the troubleshooting section above
- Review Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review React documentation: [react.dev](https://react.dev)

### Making Changes
1. Create a new branch
2. Make your changes
3. Test locally with `npm run dev`
4. Build with `npm run build`
5. Commit and push

---

## License

This project is open source and available for use in ESG (Environmental, Social, and Governance) initiatives, community engagement programs, and mining operations across Africa.

---

## Credits

**Built with:**
- React + TypeScript
- Supabase (PostgreSQL database)
- Tailwind CSS (styling)
- Vite (build tool)
- Lucide React (icons)
- Browser Geolocation API

**Designed for:**
- Mining companies operating in Africa
- Community liaison teams
- ESG compliance programs
- Stakeholder engagement initiatives

---

## Version History

**v1.0.0** - Initial Release
- Multilingual form (English/Afrikaans)
- GPS location capture
- Automatic urgency detection
- Full-featured dashboard
- Advanced filtering system
- Clickable stat cards and category charts
- Sample data generator
- Responsive design
- Netlify deployment ready

---

**Community Voice** - Empowering communities through technology 🌍

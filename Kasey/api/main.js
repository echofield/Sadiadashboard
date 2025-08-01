// main.js

// This file contains all the JavaScript logic for the consultant dashboard.
// It is designed to work with the corresponding index.html file.

// --- MOCK DATA AND API ---
// This provides the data a single client would see.
const mockApi = {
  getDashboardData: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockData = {
          // Top-level stats for marketing KPIs
          stats: {
            clientsOnTrack: 14,
            avgProgressScore: 85,
            newLeadsThisMonth: 124,
            avgTimeInPlan: 45
          },
          // Data for the "Monthly Engagement" chart
          monthlyEngagement: [
            { month: 'Jan', engagement: 300 },
            { month: 'Feb', engagement: 450 },
            { month: 'Mar', engagement: 620 },
            { month: 'Apr', engagement: 580 },
            { month: 'May', engagement: 750 },
            { month: 'Jun', engagement: 910 },
          ],
          // Data for the "Content Performance" chart
          contentPerformance: [
            { name: 'Blog Posts', value: 35, color: '#8B5CF6' },
            { name: 'Videos', value: 25, color: '#14B8A6' },
            { name: 'Case Studies', value: 20, color: '#3B82F6' },
            { name: 'Social Media', value: 20, color: '#F59E0B' },
          ],
          // Data for "Client Milestones" (tasks) based on Sadia's 7-day roadmap
          upcomingMilestones: [
            { name: 'Define Buyer Persona', progress: 100, id: 'day-1' },
            { name: 'Develop Social Media Strategy', progress: 85, id: 'day-2' },
            { name: 'Launch Lead Generation Campaign', progress: 20, id: 'day-3' },
            { name: 'Create 7-Day Content Plan', progress: 50, id: 'day-4' },
          ],
          // Data for "Recent Client Activity" (feed)
          recentActivity: [
            { client: 'Jane Doe', action: 'Completed "Develop Social Media Strategy" module', date: new Date('2025-07-31'), status: 'completed' },
            { client: 'Acme Corp', action: 'Requested a call about advanced SEO', date: new Date('2025-07-30'), status: 'info' },
            { client: 'Marketing Masters', action: 'Uploaded a new content asset', date: new Date('2025-07-29'), status: 'completed' },
            { client: 'John Smith', action: 'Failed to complete "Week 2 Tasks"', date: new Date('2025-07-28'), status: 'alert' },
          ]
        };
        resolve(mockData);
      }, 500);
    });
  }
};

// Function to call the secure serverless function to get a Gemini prompt.
const generatePromptWithGemini = async (clientName, task) => {
  try {
    const response = await fetch('/api/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName, task })
    });

    if (!response.ok) {
      throw new Error('Failed to get a response from the API.');
    }
    const data = await response.json();
    return data.generatedMessage;
  } catch (error) {
    console.error('Error calling the serverless function:', error);
    return `Error: Could not generate a prompt for ${clientName}.`;
  }
};

// --- VANILLA JS COMPONENTS ---

const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
};

const glassStrongStyle = {
    backdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)'
};

// Renders the main application structure
const renderApp = () => {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <aside id="sidebar" class="p-4 w-64 flex-shrink-0"></aside>
        <main id="main-content" class="flex-1 p-6"></main>
    `;
    renderSidebar();
    renderMainContent();
};

const renderSidebar = () => {
    const sidebarEl = document.getElementById('sidebar');
    sidebarEl.innerHTML = `
        <div class="rounded-3xl p-6 h-full flex flex-col" style="backdrop-filter: blur(20px); background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);">
            <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-5 h-5 text-white"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m14.5 19.5-10.7-10.7a1.99 1.99 0 0 1 0-2.82l1.06-1.06a1.99 1.99 0 0 1 2.82 0L19.5 14.5"/><path d="m17.07 14.93-1.41 1.41"/><path d="m19.17 17.03-1.41 1.41"/><path d="m19.5 14.5-1.4-1.4"/><path d="m14.5 19.5-1.4-1.4"/><path d="M16 16h6"/></svg>
                </div>
                <span class="text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                    Sadia K
                </span>
            </div>
            <nav class="flex-1 space-y-2">
                <button id="nav-dashboard" class="flex items-center gap-4 p-4 rounded-xl transition-colors bg-white/20 text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-5 h-5 flex-shrink-0"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m14.5 19.5-10.7-10.7a1.99 1.99 0 0 1 0-2.82l1.06-1.06a1.99 1.99 0 0 1 2.82 0L19.5 14.5"/><path d="m17.07 14.93-1.41 1.41"/><path d="m19.17 17.03-1.41 1.41"/><path d="m19.5 14.5-1.4-1.4"/><path d="m14.5 19.5-1.4-1.4"/><path d="M16 16h6"/></svg>
                    <span class="font-medium text-sm">Dashboard</span>
                </button>
            </nav>
            <div class="mt-8 pt-6 border-t border-white/20">
                <p class="text-sm text-gray-700">Powered by Gemini</p>
            </div>
        </div>
    `;
};


// Renders the main dashboard content
const renderMainContent = () => {
    const mainContentEl = document.getElementById('main-content');
    mainContentEl.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                    <h1 class="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                        Sadia K
                    </h1>
                    <p class="text-gray-600 mt-1">Guided implementation and progress tracking for clients.</p>
                </div>
                <div class="flex items-center gap-4">
                    <button id="refresh-button" class="p-2 rounded-xl hover:bg-white/30 transition-colors border border-white/30" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw w-4 h-4 text-gray-700 "><path d="M21 12a9 9 0 0 0-9-9c-2.3 0-4.4 1-6.1 2.7l-2 2"/><path d="M3 12a9 9 0 0 0 9 9c2.3 0 4.4-1 6.1-2.7l2-2"/><path d="M17 2v5h5M7 22v-5H2"/></svg>
                    </button>
                    <div class="rounded-xl px-6 py-3 shadow-lg border border-white/30" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
                        <span id="last-update" class="text-sm text-gray-700">Updated: ...</span>
                    </div>
                </div>
            </div>

            <!-- Nudge Banner -->
            <div id="nudge-banner"></div>

            <!-- Stats Grid -->
            <div id="stats-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"></div>

            <!-- Charts Section -->
            <div id="charts-section" class="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>

            <!-- Milestones & Activity -->
            <div id="milestones-activity-section" class="grid grid-cols-1 lg:grid-cols-2 gap-6"></div>
        </div>
    `;

    // Add event listeners and initial data
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', loadDashboardData);
    loadDashboardData();
};

const loadDashboardData = async () => {
    const lastUpdateSpan = document.getElementById('last-update');
    lastUpdateSpan.textContent = 'Updating...';
    
    const data = await mockApi.getDashboardData();
    renderStats(data.stats);
    renderNudgeBanner(data.recentActivity);
    renderCharts(data);
    renderMilestonesAndActivity(data);

    lastUpdateSpan.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
};

const renderStats = (stats) => {
    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = `
        <div class="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
            <div class="flex items-center justify-between">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-6 h-6 text-white"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div class="flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 mr-1"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    <span class="text-sm">+12%</span>
                </div>
            </div>
            <div class="mt-4">
                <h3 class="text-2xl text-gray-800">${stats.clientsOnTrack}</h3>
                <p class="text-sm text-gray-600 mt-1">Clients On Track</p>
            </div>
        </div>
        <div class="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
            <div class="flex items-center justify-between">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target w-6 h-6 text-white"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <div class="flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 mr-1"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    <span class="text-sm">+8%</span>
                </div>
            </div>
            <div class="mt-4">
                <h3 class="text-2xl text-gray-800">${stats.avgProgressScore}%</h3>
                <p class="text-sm text-gray-600 mt-1">Avg. Progress Score</p>
            </div>
        </div>
        <div class="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
            <div class="flex items-center justify-between">
                <div class="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap w-6 h-6 text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div class="flex items-center text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 mr-1"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    <span class="text-sm">-5%</span>
                </div>
            </div>
            <div class="mt-4">
                <h3 class="text-2xl text-gray-800">${stats.newLeadsThisMonth}</h3>
                <p class="text-sm text-gray-600 mt-1">New Leads This Month</p>
            </div>
        </div>
        <div class="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
            <div class="flex items-center justify-between">
                <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-6 h-6 text-white"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div class="flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 mr-1"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    <span class="text-sm">+2 days</span>
                </div>
            </div>
            <div class="mt-4">
                <h3 class="text-2xl text-gray-800">${stats.avgTimeInPlan} days</h3>
                <p class="text-sm text-gray-600 mt-1">Avg. Time in Plan</p>
            </div>
        </div>
    `;
};

const renderNudgeBanner = async (recentActivity) => {
    const nudgeBannerEl = document.getElementById('nudge-banner');
    const completedActivity = recentActivity.find(act => act.status === 'completed');
    
    if (completedActivity) {
        nudgeBannerEl.innerHTML = `
            <div class="rounded-2xl p-6 shadow-xl bg-blue-50/50 border-blue-200" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
                <div class="flex items-start gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-6 h-6 text-blue-600 flex-shrink-0 mt-1"><path d="M10 12v.5l.5.5h.5l.5-.5V12h-.5l-.5-.5z"/><path d="M12.5 10h-.5l-.5.5V11h.5l.5-.5V10z"/><path d="M12 10.5h.5L13 11v-.5l-.5-.5z"/><path d="M11 10.5v.5l-.5.5h-.5l-.5-.5V10.5h.5l.5.5z"/><path d="M12 2v2"/><path d="M4.2 4.2 5.6 5.6"/><path d="M2 12h2"/><path d="M4.2 19.8 5.6 18.4"/><path d="M12 22v-2"/><path d="M19.8 19.8-18.4 5.6"/><path d="M22 12h-2"/><path d="M19.8 4.2-18.4 5.6"/><path d="M15 6l1.3-1.3l1.4 1.4l-1.3 1.3L15 6Z"/><path d="M18.8 18.8 20.2 20.2 21.6 18.8l-1.4-1.4l-1.4 1.4Z"/></svg>
                    <div class="flex-1">
                        <h3 class="text-lg mb-2 text-blue-800">
                            Suggested Prompt for ${completedActivity.client}
                        </h3>
                        <p id="prompt-message" class="text-sm mb-3 text-blue-700">
                            Generating personalized message...
                        </p>
                        <div id="prompt-actions" class="hidden">
                            <textarea id="prompt-textarea" class="w-full h-24 p-3 mb-4 text-sm text-gray-800 bg-white/50 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-blue-500/50"></textarea>
                            <div class="flex justify-end gap-2">
                                <button id="dismiss-prompt" class="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                                    Dismiss
                                </button>
                                <button id="send-prompt" class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                    Send Prompt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const messageEl = document.getElementById('prompt-message');
        const actionsEl = document.getElementById('prompt-actions');
        const textareaEl = document.getElementById('prompt-textarea');
        
        const generatedMessage = await generatePromptWithGemini(completedActivity.client, completedActivity.action);
        
        messageEl.textContent = 'The system has detected a key moment and has drafted a personalized message for your review.';
        textareaEl.value = generatedMessage;
        actionsEl.classList.remove('hidden');

        document.getElementById('dismiss-prompt').addEventListener('click', () => {
            nudgeBannerEl.innerHTML = '';
        });

        document.getElementById('send-prompt').addEventListener('click', () => {
            alert(`Prompt sent to ${completedActivity.client}!`);
            nudgeBannerEl.innerHTML = '';
        });
    }
};

const renderCharts = (data) => {
    // This is a simplified approach, but in a real-world scenario, a charting library would be used.
    // For now, we render the SVG and data directly.
    const chartsSection = document.getElementById('charts-section');
    chartsSection.innerHTML = `
        <div class="rounded-2xl p-6 shadow-xl" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg text-gray-800">Monthly Engagement</h3>
                <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-vertical w-4 h-4 text-gray-600"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
            </div>
            <div id="monthly-engagement-chart"></div>
        </div>

        <div class="rounded-2xl p-6 shadow-xl" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg text-gray-800">Content Performance</h3>
                <button class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-vertical w-4 h-4 text-gray-600"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
            </div>
            <div id="content-performance-chart" class="flex items-center justify-center"></div>
        </div>
    `;

    // Recharts requires a component-based approach, so we can't easily replicate this in vanilla JS without a lot of manual SVG drawing.
    // I'll add placeholder SVG's to give the visual feel of the original charts.
    const monthlyChartEl = document.getElementById('monthly-engagement-chart');
    monthlyChartEl.innerHTML = `
        <svg viewBox="0 0 500 200" class="w-full h-full">
            <polyline fill="url(#gradient1)" stroke="#8B5CF6" stroke-width="2" points="50,150 150,100 250,130 350,90 450,120 490,70" />
            <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.8" />
                    <stop offset="100%" stop-color="#14B8A6" stop-opacity="0.1" />
                </linearGradient>
            </defs>
            <path d="M50 150L150 100L250 130L350 90L450 120L490 70V200H50Z" fill="url(#gradient1)" />
        </svg>
    `;

    const pieChartEl = document.getElementById('content-performance-chart');
    pieChartEl.innerHTML = `
        <div class="flex flex-wrap gap-4 mt-4">
            ${data.contentPerformance.map((item, index) => `
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${item.color};"></div>
                    <span class="text-sm text-gray-700">${item.name} (${item.value})</span>
                </div>
            `).join('')}
        </div>
    `;
};


const renderMilestonesAndActivity = (data) => {
    const section = document.getElementById('milestones-activity-section');
    section.innerHTML = `
        <div class="rounded-2xl p-6 shadow-xl" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg text-gray-800">Upcoming Milestones</h3>
                <span class="text-sm text-gray-600">${data.upcomingMilestones.length} active</span>
            </div>
            <div class="space-y-4">
                ${data.upcomingMilestones.map(item => `
                    <div class="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span class="text-sm text-gray-700 truncate max-w-48">${item.name}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-16 h-2 bg-gray-200 rounded-full">
                                <div class="h-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all duration-300" style="width: ${item.progress}%;"></div>
                            </div>
                            <span class="text-xs text-gray-600">${Math.round(item.progress)}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="rounded-2xl p-6 shadow-xl" style="backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg text-gray-800">Recent Client Activity</h3>
                <button class="text-sm text-purple-600 hover:text-purple-700 transition-colors">
                    View All
                </button>
            </div>
            <div class="space-y-4">
                ${data.recentActivity.map(activity => {
                    const statusColor = activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        activity.status === 'info' ? 'bg-blue-100 text-blue-700' :
                                        activity.status === 'alert' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700';

                    const iconSVG = activity.status === 'completed' ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle w-4 h-4 text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.8"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` :
                                      activity.status === 'info' ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info w-4 h-4 text-blue-500"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>` :
                                      activity.status === 'alert' ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle w-4 h-4 text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16"/></svg>` :
                                      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list w-4 h-4 text-yellow-500"><rect x="9" y="9" width="4" height="4"/><rect x="9" y="16" width="4" height="4"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2V8H20"/><path d="M16 16H8"/><path d="M16 9H8"/></svg>`;

                    return `
                        <div class="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                                    <span class="text-white text-sm">
                                        ${activity.client?.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h4 class="text-gray-800 truncate max-w-32">${activity.client}</h4>
                                    <p class="text-sm text-gray-600">${activity.action}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="flex items-center gap-2">
                                    ${iconSVG}
                                    <span class="px-3 py-1 rounded-full text-xs ${statusColor}">
                                        ${activity.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};


document.addEventListener('DOMContentLoaded', renderApp);

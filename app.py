from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import random

app = Flask(__name__)
# Enable CORS for all domains for easier integration during development
CORS(app)

# In-memory database for our Fullstack Dashboard
campaigns = [
    { "id": 1, "name": "Summer Sale 2026", "platform": "Instagram", "status": "Active", "budget": "$5,000", "spent": "$1,240", "target": "Gen Z, Millennials", "date": "Jun 1 - Aug 31", "roas": "3.2x" },
    { "id": 2, "name": "B2B Leads Q3", "platform": "LinkedIn", "status": "Paused", "budget": "$10,000", "spent": "$850", "target": "Tech Executives", "date": "Jul 1 - Sep 30", "roas": "1.8x" },
    { "id": 3, "name": "Retargeting Flow", "platform": "Google Ads", "status": "Active", "budget": "$2,000/mo", "spent": "$3,400", "target": "Website Visitors", "date": "Ongoing", "roas": "4.5x" },
    { "id": 4, "name": "Brand Awareness", "platform": "Facebook", "status": "Completed", "budget": "$5,000", "spent": "$5,000", "target": "Broad Audience", "date": "May 1 - May 31", "roas": "2.1x" }
]

def generate_performance_data():
    """Generates random trend data for the line charts"""
    return [
        {"name": "Mon", "views": random.randint(3000, 5000), "clicks": random.randint(1500, 3000)},
        {"name": "Tue", "views": random.randint(2500, 4500), "clicks": random.randint(1200, 2500)},
        {"name": "Wed", "views": random.randint(4000, 8000), "clicks": random.randint(2000, 5000)},
        {"name": "Thu", "views": random.randint(3000, 6000), "clicks": random.randint(1800, 4000)},
        {"name": "Fri", "views": random.randint(5000, 10000), "clicks": random.randint(3000, 6000)},
        {"name": "Sat", "views": random.randint(4000, 7000), "clicks": random.randint(2500, 4500)},
        {"name": "Sun", "views": random.randint(3500, 5500), "clicks": random.randint(2000, 3500)},
    ]

# --- API Endpoints ---

@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    """Returns the current list of campaigns"""
    return jsonify(campaigns)

@app.route('/api/campaigns', methods=['POST'])
def add_campaign():
    """Adds a new campaign to the list"""
    data = request.json
    new_campaign = {
        "id": len(campaigns) + 1,
        "name": data.get("name", "New Campaign"),
        "platform": data.get("platform", "Google"),
        "status": "Active",
        "budget": data.get("budget", "$0"),
        "spent": "$0",
        "target": data.get("target", "Broad Audience"),
        "date": "Started Today",
        "roas": "0.0x"
    }
    campaigns.insert(0, new_campaign) # Add to start for "Recent Activity"
    return jsonify(new_campaign), 201

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Returns data for the dashboard and analytics charts"""
    return jsonify({
        "performance": generate_performance_data(),
        "channels": [
            { "name": "Google Ads", "spend": 4000, "revenue": random.randint(7000, 9500) },
            { "name": "Instagram", "spend": 3000, "revenue": random.randint(4000, 6000) },
            { "name": "Facebook", "spend": 2000, "revenue": random.randint(3000, 4500) },
            { "name": "LinkedIn", "spend": 1780, "revenue": random.randint(2500, 3500) },
        ],
        "demographics": [
            { "name": "18-24", "value": 30 },
            { "name": "25-34", "value": 45 },
            { "name": "35-44", "value": 15 },
            { "name": "45+", "value": 10 },
        ],
        "devices": [
            { "name": "Mobile", "users": random.randint(3500, 4500), "revenue": random.randint(2000, 3000) },
            { "name": "Desktop", "users": random.randint(2500, 3500), "revenue": random.randint(1200, 1800) },
            { "name": "Tablet", "users": random.randint(1500, 2500), "revenue": random.randint(8000, 10000) }, # High LTV tablet
        ]
    })

@app.route('/api/insights', methods=['GET'])
def get_insights():
    """Returns AI recommendations and location data"""
    return jsonify({
        "recommendations": [
            {
                "id": 1,
                "type": "suggestion",
                "title": "Budget Reallocation Recommended",
                "desc": "Shift 15% of budget from Facebook to Instagram Reels. Reels currently show a 40% lower CPA for your target demographic.",
                "impact": "High Impact",
                "color": "brand-blue"
            },
            {
                "id": 2,
                "type": "alert",
                "title": "Audience Fatigue Detected",
                "desc": f"Your '{campaigns[0]['name']}' creative has been shown 5+ times to 30% of your audience. Consider refreshing the ad copy.",
                "impact": "Medium Impact",
                "color": "yellow-400"
            },
            {
                "id": 3,
                "type": "success",
                "title": "Lookalike Audience Performing Well",
                "desc": "The 1% Lookalike based on high-LTV customers is beating the benchmark conversion rate by 2.5x.",
                "impact": "Positive",
                "color": "green-400"
            }
        ],
        "locations": [
            { "city": "New York, US", "pct": random.randint(20, 30) },
            { "city": "London, UK", "pct": random.randint(15, 25) },
            { "city": "Toronto, CA", "pct": random.randint(10, 20) },
            { "city": "Sydney, AU", "pct": random.randint(5, 15) },
        ]
    })

@app.route('/analyze', methods=['POST'])
def legacy_analyze():
    """Kept for backward compatibility with the first simple dashboard"""
    data = request.json
    budget = float(data.get('budget', 1000))
    # Simple simulated metrics
    roi = round(random.uniform(50, 300), 2)
    return jsonify({
        "metrics": {
            "ctr_percent": round(random.uniform(1, 5), 2),
            "conversions": random.randint(50, 500),
            "roi_percent": roi
        },
        "ai_recommendations": ["Increase budget on Instagram", "Improve creative quality"]
    })

@app.route('/')
def index():
    return jsonify({"status": "AdGenius Fullstack API Online", "version": "2.0.0"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

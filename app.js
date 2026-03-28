// Initialize Icons
lucide.createIcons();

// Particle JS Configuration
particlesJS('particles-js', {
    "particles": {
        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": ["#38bdf8", "#c084fc", "#2dd4bf"] },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
        "size": { "value": 3, "random": true, "anim": { "enable": false } },
        "line_linked": { "enable": true, "distance": 150, "color": "#38bdf8", "opacity": 0.2, "width": 1 },
        "move": { "enable": true, "speed": 2, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
        "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } }, "push": { "particles_nb": 4 } }
    },
    "retina_detect": true
});

// Chart.js Configuration
const ctx = document.getElementById('mainChart').getContext('2d');
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = 'Inter';

// Create Gradient for line chart
const gradientBlue = ctx.createLinearGradient(0, 0, 0, 400);
gradientBlue.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
gradientBlue.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

const gradientPurple = ctx.createLinearGradient(0, 0, 0, 400);
gradientPurple.addColorStop(0, 'rgba(192, 132, 252, 0.5)');
gradientPurple.addColorStop(1, 'rgba(192, 132, 252, 0.0)');

const dataPoints = [40, 52, 48, 64, 59, 72, 85, 80, 95, 102];
const labels = ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', 'Now'];

const analyticsChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Conversions',
            data: dataPoints,
            borderColor: '#38bdf8',
            backgroundColor: gradientBlue,
            borderWidth: 2,
            pointBackgroundColor: '#0a0b10',
            pointBorderColor: '#38bdf8',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4
        },
        {
            label: 'Clicks (k)',
            data: [20, 25, 23, 30, 28, 35, 40, 38, 45, 50],
            borderColor: '#c084fc',
            backgroundColor: gradientPurple,
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8
                }
            },
            tooltip: {
                backgroundColor: 'rgba(18, 20, 32, 0.9)',
                titleColor: '#fff',
                bodyColor: '#38bdf8',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                borderWidth: 1,
                padding: 10,
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    maxTicksLimit: 5
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    }
});

// Simulate Real-time data updates
setInterval(() => {
    // Add real-time fluctuation effect
    const lastVal1 = analyticsChart.data.datasets[0].data[9];
    const lastVal2 = analyticsChart.data.datasets[1].data[9];

    analyticsChart.data.datasets[0].data[9] = lastVal1 + (Math.random() * 6 - 2);
    analyticsChart.data.datasets[1].data[9] = lastVal2 + (Math.random() * 4 - 1.5);

    analyticsChart.update('none'); // silent update
}, 2000);

// Interactions

// 1. Budget Slider
const budgetSlider = document.getElementById('budget-slider');
const budgetValue = document.getElementById('budget-value');

budgetSlider.addEventListener('input', (e) => {
    budgetValue.textContent = parseInt(e.target.value).toLocaleString();
});

// 2. Platform Buttons
const platformBtns = document.querySelectorAll('.platform-btn');
platformBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        platformBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Simulate changing data based on platform
        simulateDataChange();
    });
});

// 3. Optimize Now Button
// 3. Optimize Now Button
const optimizeBtn = document.getElementById('optimize-now-btn');
optimizeBtn.addEventListener('click', async () => {
    const originalText = optimizeBtn.innerHTML;
    optimizeBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Optimizing...';
    lucide.createIcons();

    // Gather data
    const budget = parseFloat(document.getElementById('budget-slider').value);
    const platform = document.querySelector('.platform-btn.active').dataset.platform || 'Google';
    const targetSelect = document.querySelector('.custom-select');
    const target_audience = targetSelect ? targetSelect.value : 'Broad Tech Audience';

    try {
        const response = await fetch('/api/campaign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                budget: budget,
                platform: platform,
                target_audience: target_audience,
                duration: 14 // default
            })
        });

        const data = await response.json();

        if (response.ok) {
            optimizeBtn.innerHTML = '<i data-lucide="check"></i> Optimized Successful';
            lucide.createIcons();
            optimizeBtn.style.background = 'linear-gradient(90deg, #059669, #10b981)';

            // Update metrics to show improvement
            //document.getElementById('ctr-value').textContent = data.metrics.ctr_percent + '%';
            document.getElementById('conv-value').textContent = data.metrics.conversions;
            document.getElementById('roi-value').textContent = data.metrics.roi_percent + '%';

            // Add text-green to animate
            ['ctr-value', 'conv-value', 'roi-value'].forEach(id => {
                const el = document.getElementById(id);
                el.style.color = 'var(--neon-green)';
                setTimeout(() => {
                    el.style.color = ''; // revert to class color
                }, 1000);
            });

            // Update Insights Section with AI Recommendations from backend
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer && data.ai_recommendations) {
                chatContainer.innerHTML = '';
                const types = ['suggestion', 'alert', 'info'];
                const icons = ['sparkles', 'alert-triangle', 'info'];
                const titles = ['Optimization Idea', 'Attention Needed', 'Metric Insight'];

                data.ai_recommendations.forEach((rec, index) => {
                    const typeIdx = index % 3;
                    const delayClass = index > 0 ? `delay-${index}` : '';
                    chatContainer.innerHTML += `
                        <div class="ai-bubble ${types[typeIdx]} flash ${delayClass}">
                            <div class="ai-icon"><i data-lucide="${icons[typeIdx]}"></i></div>
                            <div class="ai-text">
                                <strong>${titles[typeIdx]}</strong>
                                <p>${rec}</p>
                            </div>
                        </div>
                    `;
                });
                lucide.createIcons();
            }

            setTimeout(() => {
                optimizeBtn.innerHTML = originalText;
                optimizeBtn.style.background = '';
                lucide.createIcons();
            }, 3000);
        } else {
            throw new Error(data.error || 'Optimization failed');
        }

    } catch (err) {
        console.error(err);
        optimizeBtn.innerHTML = '<i data-lucide="x"></i> Error connecting to backend';
        lucide.createIcons();
        setTimeout(() => {
            optimizeBtn.innerHTML = originalText;
            optimizeBtn.style.background = '';
            lucide.createIcons();
        }, 3000);
    }
});

// Add simple CSS for spinning icon
const style = document.createElement('style');
style.innerHTML = `
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

function simulateDataChange() {
    const newData1 = Array.from({ length: 10 }, () => Math.floor(Math.random() * 60) + 40);
    const newData2 = Array.from({ length: 10 }, () => Math.floor(Math.random() * 30) + 20);

    analyticsChart.data.datasets[0].data = newData1;
    analyticsChart.data.datasets[1].data = newData2;
    analyticsChart.update();
}async function connectBackend() {
  const res = await fetch('/api/campaign');
  const data = await res.json();
  document.getElementById("cr_value").innerText = data.cr_value;
  console.log(data.cr_value);
}

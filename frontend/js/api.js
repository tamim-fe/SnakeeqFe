const API_URL = 'http://localhost:5000/api/scores';

async function fetchLeaderboard() {
    const listElement = document.getElementById('leaderboard-list');
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        listElement.innerHTML = '';
        if (data.length === 0) {
            listElement.innerHTML = '<li class="loading">No records yet</li>';
            return;
        }

        data.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'leader-item';
            li.innerHTML = `
                <span class="leader-name">${index + 1}. ${entry.playerName}</span>
                <span class="leader-score">${entry.points}</span>
            `;
            listElement.appendChild(li);
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        listElement.innerHTML = '<li class="loading">Leaderboard unavailable</li>';
    }
}

async function submitScore(playerName, points) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName, points })
        });
        
        if (!response.ok) throw new Error('Submission failed');
        
        return await response.json();
    } catch (error) {
        console.error('Submit error:', error);
        throw error;
    }
}

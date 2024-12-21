// Generate Upload Key
document.getElementById('generate-key').addEventListener('click', () => {
    fetch('/admin/generate-key', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            const keyList = document.getElementById('key-list');
            const li = document.createElement('li');
            li.textContent = `Key: ${data.key}`;
            keyList.appendChild(li);
        })
        .catch(err => alert('Failed to generate key: ' + err.message));
});

// Fetch Uploaded Images
document.getElementById('fetch-images').addEventListener('click', () => {
    fetch('/uploads')
        .then(response => response.json())
        .then(data => {
            const imageList = document.getElementById('image-list');
            imageList.innerHTML = ''; // Clear current list
            data.forEach(image => {
                const li = document.createElement('li');
                li.textContent = image;
                imageList.appendChild(li);
            });
        })
        .catch(err => alert('Failed to fetch images: ' + err.message));
});

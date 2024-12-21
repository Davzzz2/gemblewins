// Fetch and Display Uploaded Images with Descriptions
function loadImages() {
    fetch('/uploads')
        .then(response => response.json())
        .then(images => {
            const gallery = document.getElementById('image-gallery');
            gallery.innerHTML = ''; // Clear gallery

            images.forEach(({ filename, description }) => {
                const container = document.createElement('div');
                container.className = 'image-container';

                const img = document.createElement('img');
                img.src = `/uploads/${filename}`;
                img.alt = 'Uploaded Image';
                img.className = 'gallery-image';
                img.onclick = () => openModal(`/uploads/${filename}`, description);

                const desc = document.createElement('p');
                desc.className = 'image-description';
                desc.textContent = description || 'No description provided';

                container.appendChild(img);
                container.appendChild(desc);
                gallery.appendChild(container);
            });
        })
        .catch(err => console.error('Error loading images:', err));
}

// Open the image modal to display image in full view
function openModal(imageUrl, description) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');

    modal.style.display = 'block';
    modalImage.src = imageUrl;
    modalDescription.textContent = description;

    const closeModal = document.getElementById('close-modal');
    closeModal.onclick = () => modal.style.display = 'none';
}

// Upload a new image with description
document.getElementById('upload-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadImages(); // Reload images after upload
    })
    .catch(err => console.error('Error uploading image:', err));
});

// Initial Load of Images
loadImages();

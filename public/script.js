const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const typingIndicator = document.getElementById('typing-indicator');
const sendBtn = document.getElementById('send-btn');
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const previewImg = document.getElementById('preview-img');
const removeImgBtn = document.getElementById('remove-img-btn');

let currentImageFile = null;

// Validate input
function checkInput() {
    if (userInput.value.trim() || currentImageFile) {
        sendBtn.disabled = false;
        sendBtn.classList.add('active');
    } else {
        sendBtn.disabled = true;
        sendBtn.classList.remove('active');
    }
}

userInput.addEventListener('input', checkInput);

// Handle image selection
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        currentImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreviewContainer.style.display = 'flex';
        };
        reader.readAsDataURL(file);
        checkInput();
    }
});

// Remove image
removeImgBtn.addEventListener('click', () => {
    currentImageFile = null;
    imageUpload.value = '';
    imagePreviewContainer.style.display = 'none';
    previewImg.src = '';
    checkInput();
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message && !currentImageFile) return;

    // Add user message to UI
    let userMsgContent = message;
    if (currentImageFile) {
        userMsgContent = `<img src="${previewImg.src}" alt="User Image" class="user-uploaded-img" />` + (message ? `<p>${message}</p>` : '');
    }
    
    appendMessage('user', userMsgContent, true);
    
    const submittedImage = currentImageFile;
    const submittedMessage = message;

    // Reset inputs
    userInput.value = '';
    currentImageFile = null;
    imageUpload.value = '';
    imagePreviewContainer.style.display = 'none';
    checkInput();
    
    setLoading(true);

    try {
        let response, data;

        if (submittedImage) {
            const formData = new FormData();
            formData.append('image', submittedImage);
            formData.append('prompt', submittedMessage || 'Tolong analisa gambar ini, apakah ini fakta atau hoax?');

            response = await fetch('/generate-from-image', {
                method: 'POST',
                body: formData
            });
        } else {
            response = await fetch('/generate-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: submittedMessage }),
            });
        }

        data = await response.json();

        if (response.ok) {
            await appendMessage('bot', data.result);
        } else {
            await appendMessage('bot', 'Maaf, terjadi kesalahan: ' + (data.message || 'Gagal menghubungi server.'));
        }
    } catch (error) {
        console.error('Error:', error);
        await appendMessage('bot', 'Maaf, tidak dapat terhubung ke server. Pastikan koneksi internet stabil.');
    } finally {
        setLoading(false);
    }
});

async function appendMessage(sender, text, isRaw = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');

    if (isRaw) {
        contentDiv.innerHTML = text;
    } else {
        contentDiv.innerHTML = marked.parse(text);
    }
    
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

function setLoading(isLoading) {
    if (isLoading) {
        typingIndicator.style.display = 'flex';
        sendBtn.disabled = true;
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        typingIndicator.style.display = 'none';
        checkInput();
    }
}

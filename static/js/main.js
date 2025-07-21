document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileSelected = document.getElementById('fileSelected');
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const resultSection = document.getElementById('resultSection');
    const uploadSection = document.querySelector('.upload-section');
    
    let selectedFile = null;

    // File drag and drop handlers
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDragOver(e) {
        dropZone.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        dropZone.classList.remove('drag-over');
    }

    function handleDrop(e) {
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect({ target: { files: files } });
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            showSelectedFile(file);
            generateBtn.disabled = false;
        }
    }

    function showSelectedFile(file) {
        const fileName = document.getElementById('selectedFileName');
        const fileSize = document.getElementById('selectedFileSize');
        
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        dropZone.style.display = 'none';
        fileSelected.style.display = 'block';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Remove file handler
    document.getElementById('removeFile').addEventListener('click', function(e) {
        e.stopPropagation();
        selectedFile = null;
        fileSelected.style.display = 'none';
        dropZone.style.display = 'block';
        generateBtn.disabled = true;
        fileInput.value = '';
    });

    // Generate link handler
    generateBtn.addEventListener('click', function() {
        if (!selectedFile) return;
        
        showLoading(true);
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            showLoading(false);
            if (data.success) {
                showResult(data);
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            showLoading(false);
            console.error('Error:', error);
            alert('An error occurred while uploading the file.');
        });
    });

    function showLoading(show) {
        loading.style.display = show ? 'block' : 'none';
        generateBtn.style.display = show ? 'none' : 'block';
    }

    function showResult(data) {
        document.getElementById('qrCode').src = data.qr_code;
        document.getElementById('shareLink').value = data.download_url;
        
        fileSelected.style.display = 'none';
        resultSection.style.display = 'block';
    }

    // Copy link handler
    document.getElementById('copyBtn').addEventListener('click', function() {
        const linkInput = document.getElementById('shareLink');
        linkInput.select();
        document.execCommand('copy');
        
        const copyBtn = this;
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '#FFD700';
        }, 2000);
    });

    // New upload handler
    document.getElementById('newUploadBtn').addEventListener('click', function() {
        // Reset all states
        selectedFile = null;
        fileInput.value = '';
        generateBtn.disabled = true;
        
        // Hide result and show upload area
        resultSection.style.display = 'none';
        dropZone.style.display = 'block';
        fileSelected.style.display = 'none';
    });
});

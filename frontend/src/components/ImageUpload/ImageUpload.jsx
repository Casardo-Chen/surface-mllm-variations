import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import './ImageUpload.scss';

const ImageUpload = ({ onImageChange, currentImage }) => {
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file', 'url', 'camera'
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const cameraCanvasRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        onImageChange({
          source: 'base64',
          data: base64Image,
          preview: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange({
        source: 'url',
        data: urlInput.trim(),
        preview: urlInput.trim()
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment'
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (cameraVideoRef.current && cameraCanvasRef.current) {
      const video = cameraVideoRef.current;
      const canvas = cameraCanvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      onImageChange({
        source: 'base64',
        data: base64Image,
        preview: base64Image
      });
      
      stopCamera();
    }
  };

  const clearImage = () => {
    onImageChange({
      source: 'url',
      data: '',
      preview: ''
    });
    setUrlInput('');
  };

  return (
    <div className="image-upload-container">
      <div className="upload-methods">
        <div className="method-tabs">
          <button 
            className={`method-tab ${uploadMethod === 'file' ? 'active' : ''}`}
            onClick={() => setUploadMethod('file')}
          >
            📁 File
          </button>
          <button 
            className={`method-tab ${uploadMethod === 'url' ? 'active' : ''}`} 
            onClick={() => setUploadMethod('url')}
          >
            🔗 URL
          </button>
          <button 
            className={`method-tab ${uploadMethod === 'camera' ? 'active' : ''}`}
            onClick={() => setUploadMethod('camera')}
          >
            📷 Camera
          </button>
        </div>

        <div className="upload-content">
          {uploadMethod === 'file' && (
            <div 
              className={`file-upload-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div className="upload-icon">📁</div>
              <p className="upload-text">
                {isDragOver ? 'Drop image here' : 'Click to upload or drag & drop'}
              </p>
              <p className="upload-hint">Supports JPG, PNG, GIF, WebP</p>
            </div>
          )}

          {uploadMethod === 'url' && (
            <div className="url-upload-area">
              <div className="url-input-group">
                <input
                  type="url"
                  placeholder="Enter image URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="url-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <Button 
                  onClick={handleUrlSubmit}
                  variant="mono"
                  disabled={!urlInput.trim()}
                >
                  Load
                </Button>
              </div>
            </div>
          )}

          {uploadMethod === 'camera' && (
            <div className="camera-upload-area">
              {!showCamera ? (
                <div className="camera-start">
                  <div className="camera-icon">📷</div>
                  <p className="camera-text">Take a photo with your camera</p>
                  <Button onClick={startCamera} variant="mono">
                    Open Camera
                  </Button>
                </div>
              ) : (
                <div className="camera-capture">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    className="camera-video"
                  />
                  <canvas
                    ref={cameraCanvasRef}
                    style={{ display: 'none' }}
                  />
                  <div className="camera-controls">
                    <button onClick={capturePhoto} className="capture-btn">
                      📸 Capture
                    </button>
                    <button onClick={stopCamera} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {currentImage && (
        <div className="image-preview-section">
          <div className="preview-header">
            <h4>Image Preview</h4>
            <button onClick={clearImage} className="clear-btn">
              ✕ Clear
            </button>
          </div>
          <div className="image-preview">
            {currentImage && <img src={currentImage} alt="Preview" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

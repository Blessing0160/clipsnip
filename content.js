function addClipSnipButton() {
    const controlsContainer = document.querySelector('#top-level-buttons-computed');
    if (!controlsContainer) {
      console.warn('Controls container not found');
      return;
    }
    if (document.querySelector('#clipsnip-btn')) return;
  
    const clipSnipBtn = document.createElement('button');
    clipSnipBtn.id = 'clipsnip-btn';
    clipSnipBtn.textContent = 'ClipSnip';
    clipSnipBtn.style.marginLeft = '10px';
    clipSnipBtn.style.padding = '8px 16px';
    clipSnipBtn.style.cursor = 'pointer';
    clipSnipBtn.style.backgroundColor = '#ff0000';
    clipSnipBtn.style.color = '#fff';
    clipSnipBtn.style.border = 'none';
    clipSnipBtn.style.borderRadius = '20px';
  
    clipSnipBtn.addEventListener('click', () => {
      console.log('ClipSnip button clicked');
      injectClipSnipModal();
    });
    controlsContainer.appendChild(clipSnipBtn);
  }
  
  function injectClipSnipModal() {
    if (document.querySelector('#clipsnip-modal')) {
      console.log('Modal already exists');
      return;
    }
  
    const modalHTML = `
      <div id="clipsnip-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;"></div>
      
      <div id="clipsnip-modal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1a1a1a; padding: 20px; z-index: 10000; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); text-align: center;">
        <h1 style="color: #fff; margin-bottom: 8px; margin-top:5px;">Record For</h1>
        <div style="margin-bottom: 16px;">
          <button class="duration-btn" data-duration="5" style="padding: 8px 12px; margin: 1px 7px; background: #333333; color: #fff; border: none; border-radius: 4px;">5s</button>
          <button class="duration-btn" data-duration="10" style="padding: 8px 12px; margin: 1px 7px; background: #333333; color: #fff; border: none; border-radius: 4px;">10s</button>
          <button class="duration-btn" data-duration="15" style="padding: 8px 12px; margin: 1px 7px; background: #333333; color: #fff; border: none; border-radius: 4px;">15s</button>
        </div>
        <div id="close-btn" style="width: 15px; height: 15px; background: #ff5f56; border-radius: 50%; cursor: pointer; position: absolute; top: 10px; right: 10px;"></div>
      </div>
    `;
  
    try {
      const container = document.createElement('div');
      container.innerHTML = modalHTML;
      document.body.appendChild(container);
  
      // Event listeners
      const closeModal = () => {
        const modal = document.querySelector('#clipsnip-modal');
        const overlay = document.querySelector('#clipsnip-overlay');
        if (modal) modal.remove();
        if (overlay) overlay.remove();
      };
      document.querySelector('#close-btn').addEventListener('click', closeModal);
      document.querySelector('#clipsnip-overlay').addEventListener('click', closeModal);

      // Add event listeners to duration buttons
      document.querySelectorAll('.duration-btn').forEach(button => {
        button.addEventListener('click', () => {
          const duration = parseInt(button.dataset.duration);
          startRecording(duration);
          closeModal();
        });
      });     

    } catch (error) {
      console.error('Error injecting modal:', error);
    }
  }
  
  function startRecording(duration = 5) {
    const video = document.querySelector('video');
    if (!video) {
      console.error('Video element not found');
      return;
    }

    try {
      const stream = video.captureStream();
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      showToast('Recording in progress... Please don’t close this tab.', duration * 950);

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        showToast('Recording Complete.');
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clipsnip-${duration}s-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start();
      video.play();
      setTimeout(() => {
        recorder.stop();
        video.pause();
      }, duration * 1000);
    } catch (error) {
      console.error('Recording error:', error);
      showToast('Recording failed. This may be a DRM-protected video.');
    }
}
  
  function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.fontSize = '14px';
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    toast.style.background = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '99999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, duration);
  }

    function observePageChanges() {
      const targetNode = document.querySelector('title') || document.body;
      const observer = new MutationObserver(() => {
        if (window.location.href.includes('watch')) {
          console.log('Page change detected, re-injecting button');
          addClipSnipButton();
        }
      });
    
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
    
    // Initialize
    try {
      addClipSnipButton();
      observePageChanges();
    } catch (error) {
      console.error('Initialization error:', error);
  }
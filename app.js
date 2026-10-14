const form = document.querySelector('#download-form');
const input = document.querySelector('#video-url');
const button = document.querySelector('#download-button');
const notice = document.querySelector('#notice');
const result = document.querySelector('#result');
const saveButton = document.querySelector('#save-button');

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = input.value.trim();
  result.hidden = true;
  notice.hidden = true;

  if (!/^https?:\/\/(www\.)?instagram\.com\/(reel|p)\//i.test(url)) {
    showNotice('Geçerli bir Instagram Reel veya gönderi bağlantısı gir.');
    return;
  }

  button.disabled = true;
  button.textContent = 'Kontrol ediliyor…';
  try {
    const response = await fetch('/api/reels/resolve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Bu bağlantı için indirilebilir bir medya bulunamadı.');
    if (!data.downloadUrl || !data.contentType.startsWith('video/')) throw new Error('Sunucu geçerli bir video döndürmedi.');
    saveButton.href = data.downloadUrl;
    saveButton.download = data.filename || 'clipsave-video.mp4';
    result.hidden = false;
  } catch (error) {
    showNotice(error instanceof Error ? error.message : 'Video hazırlanamadı. Lütfen tekrar dene.');
  } finally {
    button.disabled = false;
    button.textContent = 'Videoyu hazırla';
  }
});

# ClipSave local

## Kurulum

`yt-dlp` ve FFmpeg'i kurup PATH'e ekleyin. Windows için:

```powershell
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg.Shared
```

Ardından sunucuyu başlatın:

```powershell
npm start
```

`http://localhost:8787` adresini açın.

## Render deployment

Render'da **New → Web Service** seçin, GitHub'dan `azmedalab-cmd/clipsave-web` reposunu bağlayın ve Docker runtime ile deploy edin. Repo içindeki `render.yaml` ve `Dockerfile` ayarları kullanılır. Deploy tamamlanınca Render size `https://clipsave-web.onrender.com` benzeri bir adres verir.

Bu proje yalnızca herkese açık ve indirme hakkınız olan tekil Instagram Reel/gönderilerini destekler. Özel hesaplar, giriş çerezleri, playlist indirme veya erişim kısıtlarını aşma desteklenmez. Instagram değişiklikleri nedeniyle çözücü zaman zaman çalışmayabilir.

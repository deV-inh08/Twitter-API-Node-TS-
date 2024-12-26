import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

function App() {
  return (
    <>

<MediaPlayer 
  title="Test Video" 
  src="http://localhost:4000/static/video-hls/YeDbpCWYYHhsCb8YphOAA/master.m3u8">
  <MediaProvider />
  <DefaultVideoLayout 
    thumbnails="http://localhost:4000/static/video-hls/YeDbpCWYYHhsCb8YphOAA/thumbnails.vtt" 
    icons={defaultLayoutIcons} 
  />
</MediaPlayer>

    </>
  )
}

export default App


// http://localhost:4000/static/video-hls/YeDbpCWYYHhsCb8YphOAA/v0/fileSequence0.ts
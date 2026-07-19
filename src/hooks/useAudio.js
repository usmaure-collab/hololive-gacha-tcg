import { useCallback, useRef, useEffect } from 'react';

// Pool size for each sound to handle rapid overlapping clicks
const POOL_SIZE = 3;

export function useAudio() {
  const audioPools = useRef({
    hover: [],
    click: [],
    tear: [],
    hit: []
  });

  const isMuted = useRef(false); // Global mute state if needed

  useEffect(() => {
    // Preload audio elements into pools
    const createPool = (src) => {
      return Array.from({ length: POOL_SIZE }).map(() => {
        const audio = new Audio(src);
        audio.preload = 'auto';
        return audio;
      });
    };

    audioPools.current = {
      hover: createPool('/sfx/hover.mp3'),
      click: createPool('/sfx/click.mp3'),
      tear: createPool('/sfx/tear.mp3'),
      hit: createPool('/sfx/hit.mp3')
    };

    // Cleanup on unmount
    return () => {
      Object.values(audioPools.current).forEach(pool => {
        pool.forEach(audio => {
          audio.pause();
          audio.src = '';
        });
      });
    };
  }, []);

  const playSound = useCallback((type) => {
    if (isMuted.current) return;
    
    const pool = audioPools.current[type];
    if (!pool || pool.length === 0) return;

    // Find the first audio element that is currently paused or ended
    let availableAudio = pool.find(audio => audio.paused || audio.ended);
    
    // If all are busy, aggressively reset the first one and play it
    if (!availableAudio) {
      availableAudio = pool[0];
    }
    
    availableAudio.currentTime = 0;
    availableAudio.play().catch(e => {
      // Browsers block audio until user interaction
      console.warn(`Audio play failed for ${type}:`, e);
    });
  }, []);

  return {
    playHover: () => playSound('hover'),
    playClick: () => playSound('click'),
    playPackTear: () => playSound('tear'),
    playHitReveal: () => playSound('hit'),
  };
}

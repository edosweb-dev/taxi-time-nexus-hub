import { useEffect, useState } from "react";

export const useKeyboardVisible = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (!window.visualViewport) return;
      
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // Threshold: 75% - keyboard is considered open if viewport < 75% of window height
      setIsVisible(viewportHeight < windowHeight * 0.75);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      
      // Initial check
      handleResize();
      
      return () => {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      };
    }
  }, []);

  return isVisible;
};

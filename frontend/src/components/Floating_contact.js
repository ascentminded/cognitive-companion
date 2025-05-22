import React, { useState, useEffect, useRef } from 'react';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-label="Contact me"
        className="floating-contact-button"
        onClick={() => setIsOpen(prev => !prev)}
      >
        &#9993; {/* Envelope icon, you can replace with SVG if you want */}
      </button>

      <div
        ref={popupRef}
        className={`contact-popup ${isOpen ? 'active' : ''}`}
        onClick={e => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Replace with your actual contact content */}
        <h3>Contact Me</h3>
        <p>You can reach me at <a href="mailto:youremail@example.com">youremail@example.com</a></p>
      </div>
    </>
  );
}

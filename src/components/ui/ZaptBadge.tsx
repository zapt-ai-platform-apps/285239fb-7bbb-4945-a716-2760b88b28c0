const ZaptBadge = () => {
  return (
    <div className="fixed bottom-4 left-4 z-20">
      <a 
        href="https://www.zapt.ai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs opacity-70 hover:opacity-100 transition-opacity flex items-center"
      >
        Made on ZAPT
      </a>
    </div>
  );
};

export default ZaptBadge;
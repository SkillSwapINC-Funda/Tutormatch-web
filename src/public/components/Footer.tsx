
const Footer = () => {
  return (
    <footer className="bg-[#d93649] py-4">
      <div className="container mx-auto px-4 flex justify-center items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 flex items-center justify-center rounded">
          <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
          </div>
          <span className="ml-2 text-white font-semibold">TutorMatch</span>
        </div>
        <span className="text-white text-sm ml-4">© 2025 TutorMatch. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
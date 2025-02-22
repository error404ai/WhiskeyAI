const Footer = () => {
  return (
    <footer className="bg-black p-6 text-white">
      <div className="container mx-auto flex justify-between">
        <p>&copy; {new Date().getFullYear()} Twitter AI Agent</p>
        <p>Agent</p>
      </div>
    </footer>
  );
};

export default Footer;

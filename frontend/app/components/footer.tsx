export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 flex items-center justify-center w-full h-16">
      <p className="text-sm text-zinc-500 select-none">
        © {new Date().getFullYear()} eylexander
      </p>
    </footer>
  );
};

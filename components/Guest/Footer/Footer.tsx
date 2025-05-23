import { Github, Mail, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        {/* <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Product</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <a href="https://whiskey-ai.gitbook.io/whiskey-ai" target="_blank" className="hover:text-primary">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Legal</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <a href="/faq" className="hover:text-primary">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div> */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} WhiskeyAI Agent. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <a href="https://github.com/error404ai/WhiskeyAI" target="_blank" className="text-muted-foreground hover:text-primary">
              <Github className="h-5 w-5" />
              <span className="sr-only">Github</span>
            </a>
            <a href="https://x.com/thewhiskeyai" target="_blank" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="mailto:support@thewhiskey.io" className="text-muted-foreground hover:text-primary">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

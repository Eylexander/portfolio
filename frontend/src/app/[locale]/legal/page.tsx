'use client';
import React from "react";
import { Navigation } from "@/src/components/nav";
import { Card } from "@/src/components/card";
import {Link} from "@/src/i18n/navigation";

export default function LegalPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            legal notice
          </h2>
          <p className="mt-4 text-zinc-400">
            Information in accordance with legal requirements.
          </p>
        </div>

        <Card>
          <article className="relative w-full h-full p-4 md:p-8">
            <div>
              <h2 className="my-4 text-3xl font-bold text-zinc-100 sm:text-4xl font-display">
                Site Owner
              </h2>
              <div className="mt-4 text-zinc-400 space-y-2">
                <p><strong>Name:</strong> [Your Full Name]</p>
                <p><strong>Address:</strong> [Your Address]</p>
                <p><strong>Email:</strong> eylexander88@gmail.com</p>
              </div>
              
              <h3 className="mt-8 text-2xl font-bold text-zinc-100 font-display">
                Disclaimer
              </h3>
              <p className="mt-4 leading-8 text-zinc-400">
                The information contained in this website is for general information purposes only. The information is provided by [Your Name] and while we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
              </p>
              
              <h3 className="mt-8 text-2xl font-bold text-zinc-100 font-display">
                Copyright
              </h3>
              <p className="mt-4 leading-8 text-zinc-400">
                © {currentYear} [Your Name]. All rights reserved. All content on this website, including text, images, graphics, and code, is the property of [Your Name] and is protected by international copyright laws. Unauthorized use and/or duplication of this material without express and written permission is strictly prohibited.
              </p>
              
              <h3 className="mt-8 text-2xl font-bold text-zinc-100 font-display">
                Privacy Policy
              </h3>
              <p className="mt-4 leading-8 text-zinc-400">
                This website uses cookies to enhance the user experience. By using this website, you consent to the use of cookies in accordance with our privacy policy.
              </p>
              
              <h3 className="mt-8 text-2xl font-bold text-zinc-100 font-display">
                Contact
              </h3>
              <p className="mt-4 leading-8 text-zinc-400">
                If you have any questions or concerns about the legal aspects of this website, please contact us at:
              </p>
              <p className="mt-2 text-zinc-400">
                <Link href="mailto:eylexander88@gmail.com" className="text-zinc-300 hover:text-white">
                  eylexander88@gmail.com
                </Link>
              </p>
            </div>
          </article>
        </Card>

      </div>
    </div>
  );
}
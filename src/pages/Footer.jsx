import React from 'react'
import {MapPin,Mail,Phone} from 'lucide-react'
import { px } from 'motion'


function Footer({setActiveTab}) {
  
  return (
   <>
    <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Contact & Location */}
            <div>
              <h4 className="text-xl font-bold mb-4">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Delhi, India</p>
                    <p className="text-gray-400 text-sm">Shalimar Bhag, New Delhi - 110001</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={20} />
                  <p>adityayadavvv12@gmail.com</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={20} />
                  <p>9936096673</p>
                </div>
              <div className='' >
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27993.05960748825!2d77.13689813876292!3d28.71558743961473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d019b1d5d2c0b%3A0xc1e6a3811f55c247!2sShalimar%20Bagh%2C%20Delhi!5e0!3m2!1sen!2sin!4v1759593051228!5m2!1sen!2sin" height= "100rem" width="200rem" loading="lazy" ></iframe>
                </div>
              </div>
            </div>

            {/* Creative & Design Tools */}
            <div>
              <h4 className="text-xl font-bold mb-4">Creative & Design</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('qr-generator')}>QR Code Generator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('gradient')}>Gradient Generator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('color-picker')}>Color Picker</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('meme-generator')}>Meme Generator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('logo-maker')}>Logo Maker</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('bg-remover')}>Background Remover</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('image-compressor')}>Image Compressor</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('favicon')}>Favicon Generator</li>
              </ul>
            </div>

            {/* Text & Productivity Tools */}
            <div>
              <h4 className="text-xl font-bold mb-4">Text & Productivity</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('text-speech')}>Text to Speech</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('word-counter')}>Word Counter</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('markdown')}>Markdown Editor</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('lorem')}>Lorem Ipsum Generator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('password-gen')}>Password Generator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('pomodoro')}>Pomodoro Timer</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('todo')}>Todo List</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('notes')}>Notes App</li>
              </ul>
            </div>

            {/* Calculators & More */}
            <div>
              <h4 className="text-xl font-bold mb-4">Calculators & More</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('calculator')}>Calculator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('bmi')}>BMI Calculator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('age')}>Age Calculator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('currency')}>Currency Converter</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('unit')}>Unit Converter</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('loan')}>Loan Calculator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('tip')}>Tip Calculator</li>
                <li className="hover:text-white cursor-pointer transition" onClick={() => setActiveTab('json')}>JSON Formatter</li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">© 2025 ToolBox Store - All Tools in One Place</p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition">About Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
   </>
  )
}

export default Footer

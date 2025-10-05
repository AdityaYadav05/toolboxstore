import React from 'react'
import { useState } from 'react';
import {ShoppingCart,X,Home,Menu,ChevronDown} from "lucide-react"

function Navbar({activeTab,setActiveTab,toolCategories}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-white via-purple-500 to-pink-500 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <ShoppingCart className="text-indigo-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">ToolBox Store</h1>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            
            {/* Desktop Navigation - Show on md and above */}
            <nav className="hidden md:flex items-center gap-1 flex-wrap">
              <button onClick={() => setActiveTab('home')} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition font-semibold text-sm ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Home size={18} />
                Home
              </button>
              
              {toolCategories && Object.entries(toolCategories).map(([key, category]) => (
                <div key={key} className="relative group" 
                  onMouseEnter={() => setOpenDropdown(key)} 
                  onMouseLeave={() => setOpenDropdown(null)}>
                  <button className=" flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition font-semibold  whitespace-nowrap text-sm">
                    {category.name}
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </button>
                  {openDropdown === key && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 w-72 max-h-96 overflow-y-auto z-50">
                      <div className="py-2">
                        {category.tools.map(tool => (
                          <button key={tool.id} 
                            onClick={() => { setActiveTab(tool.id); setOpenDropdown(null); }}
                            className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition text-sm ${activeTab === tool.id ? 'bg-indigo-100 text-indigo-600 font-semibold border-l-4 border-indigo-600' : 'text-gray-700'}`}>
                            {tool.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation - Show below lg breakpoint (below 1024px) */}
          {menuOpen && (
            <div className="lg:hidden border-t mt-4 pt-4 max-h-[70vh] overflow-y-auto">
              <button onClick={() => { setActiveTab('home'); setMenuOpen(false); }} 
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg mb-2 font-semibold transition ${activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Home size={20} />
                Home
              </button>
              {Object.entries(toolCategories).map(([key, category]) => (
                <div key={key} className="mb-3">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                    className="w-full flex items-center justify-between px-4 py-3 font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                    {category.name}
                    <ChevronDown size={18} className={`transition-transform ${openDropdown === key ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === key && (
                    <div className="mt-1 ml-2 space-y-1">
                      {category.tools.map(tool => (
                        <button key={tool.id} 
                          onClick={() => { setActiveTab(tool.id); setMenuOpen(false); setOpenDropdown(null); }}
                          className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === tool.id ? 'bg-indigo-100 text-indigo-600 font-semibold border-l-4 border-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {tool.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
  )
}

export default Navbar

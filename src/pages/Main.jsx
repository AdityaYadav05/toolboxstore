import React from 'react'

function Main({activeTab,toolCategories,setActiveTab}) {

  
const allTools = Object.values(toolCategories).flatMap(cat => cat.tools);
  const ActiveComponent = allTools.find(t => t.id === activeTab)?.component;

  return (
    <>
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
        {activeTab === 'home' ? (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-white mb-4">Welcome to ToolBox Store</h2>
              <p className="text-xl text-white">50+ Professional Tools in One Place</p>
            </div>
            {Object.entries(toolCategories).map(([key, category]) => (
              <div key={key} className="mb-12">
                <h3 className="text-3xl font-bold text-white mb-6">{category.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.tools.map(tool => (
                    <div key={tool.id} 
                      onClick={() => setActiveTab(tool.id)}
                      className="border-l-4 border-[#de1972]  bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-1">
                      <h4 className="text-lg font-bold text-gray-800">{tool.name}</h4>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              {allTools.find(t => t.id === activeTab)?.name}
            </h2>
            {ActiveComponent && <ActiveComponent />}
          </div>
        )}
      </main>
    </>
  )
}

export default Main;
